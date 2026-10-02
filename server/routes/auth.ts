import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';

export const authRouter = Router();

// Get current session user
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }

    const user = await db.user.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    const campus = await db.campus.findById(user.campus.toString());
    const stats = await db.review.getSellerStats(user._id.toString());

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        campusId: user.campus,
        campusName: campus ? campus.name : '',
        createdAt: user.createdAt,
        sellerRating: stats.average,
        reviewCount: stats.count,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Session verification failed' });
  }
});

// Student Registration
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, campusCode } = req.body;

    // Validate inputs
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (!campusCode || !campusCode.trim()) {
      return res.status(400).json({ error: 'Campus code is required.' });
    }

    // Verify campus code matches configured campus
    const targetCampus = await db.campus.findByCode(campusCode.trim());
    if (!targetCampus) {
      return res.status(400).json({
        error: 'Invalid campus code. Please enter the exact code provided by your campus administrator.',
      });
    }

    // Check duplicate email
    const existingUser = await db.user.findByEmail(email.trim());
    if (existingUser) {
      return res.status(400).json({
        error: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db.user.create({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      campusId: targetCampus._id.toString(),
    });

    // Establish session
    req.session.userId = newUser._id.toString();
    req.session.campusId = targetCampus._id.toString();

    return res.status(201).json({
      message: 'Registration successful! Welcome to SmartCampus.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: '',
        campusId: targetCampus._id,
        campusName: targetCampus.name,
        createdAt: newUser.createdAt,
        sellerRating: 0,
        reviewCount: 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

// Student Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.user.findByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const campus = await db.campus.findById(user.campus.toString());
    const stats = await db.review.getSellerStats(user._id.toString());

    // Establish session
    req.session.userId = user._id.toString();
    req.session.campusId = user.campus.toString();

    return res.json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        campusId: user.campus,
        campusName: campus ? campus.name : '',
        createdAt: user.createdAt,
        sellerRating: stats.average,
        reviewCount: stats.count,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

// Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully.' });
  });
});

// Update profile / avatar
authRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { avatar } = req.body;
    if (avatar && typeof avatar === 'string') {
      // Basic size check for stored image (approx ~2MB base64)
      if (avatar.length > 3 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image size exceeds maximum limit (2MB).' });
      }
      await db.user.updateAvatar(req.session.userId, avatar);
    }

    const updated = await db.user.findById(req.session.userId);
    return res.json({
      message: 'Profile updated successfully.',
      avatar: updated?.avatar || '',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Profile update failed.' });
  }
});
