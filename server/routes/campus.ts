import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';

export const campusRouter = Router();

// Check if campus is configured
campusRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const campus = await db.campus.findFirst();
    if (!campus) {
      return res.json({ configured: false });
    }
    return res.json({
      configured: true,
      campus: {
        id: campus._id,
        name: campus.name,
        code: campus.code,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to check campus status' });
  }
});

// One-time setup
campusRouter.post('/setup', async (req: Request, res: Response) => {
  try {
    const existing = await db.campus.findFirst();
    if (existing) {
      return res.status(400).json({
        error: 'Campus is already configured. Setup can only be completed once.',
      });
    }

    const { name, code } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Campus or college name is required.' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Unique campus code is required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 3) {
      return res.status(400).json({ error: 'Campus code must be at least 3 characters long.' });
    }

    const created = await db.campus.create({
      name: name.trim(),
      code: cleanCode,
    });

    return res.status(201).json({
      message: 'Campus initialized successfully!',
      campus: {
        id: created._id,
        name: created.name,
        code: created.code,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to initialize campus.' });
  }
});

// Seed demo data for instant evaluation / viva presentation
campusRouter.post('/seed-demo', async (req: Request, res: Response) => {
  try {
    let campus = await db.campus.findFirst();
    if (!campus) {
      campus = await db.campus.create({
        name: 'Metropolitan Institute of Technology',
        code: 'CAMPUS2025',
      });
    }

    // Check if demo users already exist
    let studentA = await db.user.findByEmail('rohan.sharma@campus.edu');
    let studentB = await db.user.findByEmail('ananya.patel@campus.edu');

    if (!studentA) {
      studentA = await db.user.create({
        name: 'Rohan Sharma',
        email: 'rohan.sharma@campus.edu',
        passwordHash: bcrypt.hashSync('Password123!', 10),
        campusId: campus._id,
      });
    }

    if (!studentB) {
      studentB = await db.user.create({
        name: 'Ananya Patel',
        email: 'ananya.patel@campus.edu',
        passwordHash: bcrypt.hashSync('Password123!', 10),
        campusId: campus._id,
      });
    }

    // Create sample listings if none exist
    const existingResources = await db.resource.findMany({ campusId: campus._id });
    if (existingResources.length === 0) {
      await db.resource.create({
        title: 'Introduction to Algorithms (CLRS 3rd Edition)',
        category: 'Books',
        description: 'Comprehensive guide to algorithms used in Semester 4 CS courses. Very clean copy with minimal pencil markings.',
        price: 450,
        condition: 'Like New',
        image: '/src/assets/images/college_textbook_book_1790937741918.jpg',
        sellerId: studentA._id,
        campusId: campus._id,
      });

      await db.resource.create({
        title: 'Complete Operating Systems Handwritten Notes & Diagrams',
        category: 'Notes / Study Material',
        description: 'In-depth notes covering Process Synchronization, Deadlocks, Virtual Memory, and Linux system calls. Scored 94/100.',
        price: 180,
        condition: 'Good',
        image: '/src/assets/images/student_study_notes_1790937753281.jpg',
        sellerId: studentB._id,
        campusId: campus._id,
      });

      await db.resource.create({
        title: 'Engineering Drawing Toolset with Mini Drafter & Compass Kit',
        category: 'Stationery',
        description: 'Complete technical drawing drafting kit with roller scale, compass set, set-squares, and protective case.',
        price: 320,
        condition: 'Good',
        image: '',
        sellerId: studentA._id,
        campusId: campus._id,
      });
    }

    return res.json({
      message: 'Demo campus & resources initialized successfully for testing.',
      campus: {
        id: campus._id,
        name: campus.name,
        code: campus.code,
      },
      demoCredentials: [
        { email: 'rohan.sharma@campus.edu', password: 'Password123!' },
        { email: 'ananya.patel@campus.edu', password: 'Password123!' },
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to seed demo data.' });
  }
});
