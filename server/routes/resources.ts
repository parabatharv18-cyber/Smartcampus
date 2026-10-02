import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const resourcesRouter = Router();

const VALID_CATEGORIES = ['Books', 'Notes / Study Material', 'Stationery'];
const VALID_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

// Middleware to ensure user is logged in
function requireAuth(req: Request, res: Response, next: () => void) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Please log in to perform this action.' });
  }
  next();
}

// Helper to determine active campus ID
async function resolveCampusId(req: Request): Promise<string | null> {
  if (req.session?.campusId) {
    return req.session.campusId;
  }
  const firstCampus = await db.campus.findFirst();
  return firstCampus ? firstCampus._id.toString() : null;
}

// GET /api/resources - Browse available resources with search and filters
resourcesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const campusId = await resolveCampusId(req);
    if (!campusId) {
      return res.json({ resources: [] });
    }

    const { category, condition, search, minPrice, maxPrice } = req.query;

    const filter: any = { campusId };

    if (category && VALID_CATEGORIES.includes(category as string)) {
      filter.category = category as string;
    }

    if (condition && VALID_CONDITIONS.includes(condition as string)) {
      filter.condition = condition as string;
    }

    if (search && typeof search === 'string' && search.trim()) {
      filter.search = search.trim();
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      filter.minPrice = Number(minPrice);
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      filter.maxPrice = Number(maxPrice);
    }

    const resources = await db.resource.findMany(filter);
    return res.json({ resources });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch resources.' });
  }
});

// GET /api/resources/my - Get current seller's own listings
resourcesRouter.get('/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const campusId = req.session!.campusId!;
    const sellerId = req.session!.userId!;

    const resources = await db.resource.findMany({
      campusId,
      sellerId,
    });

    return res.json({ resources });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch your listings.' });
  }
});

// GET /api/resources/:id - Get resource details + seller profile info + reviews
resourcesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await db.resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    // Ensure campus matches if user has session
    if (req.session?.campusId && resource.campus.toString() !== req.session.campusId) {
      return res.status(403).json({ error: 'Access denied. Resource belongs to another campus.' });
    }

    // Fetch seller reputation and reviews
    const sellerId = resource.seller._id.toString();
    const stats = await db.review.getSellerStats(sellerId);
    const reviews = await db.review.findBySeller(sellerId);

    // Check if the current user has already requested this resource
    let existingRequest = null;
    if (req.session?.userId) {
      existingRequest = await db.request.findExistingPending(req.session.userId, id);
    }

    return res.json({
      resource: {
        id: resource._id,
        title: resource.title,
        category: resource.category,
        description: resource.description,
        price: resource.price,
        condition: resource.condition,
        image: resource.image,
        status: resource.status,
        createdAt: resource.createdAt,
        campus: resource.campus,
        seller: {
          id: resource.seller._id,
          name: resource.seller.name,
          avatar: resource.seller.avatar,
          memberSince: resource.seller.createdAt,
          averageRating: stats.average,
          reviewCount: stats.count,
        },
      },
      sellerReviews: reviews,
      hasPendingRequest: !!existingRequest,
      isOwner: req.session?.userId === sellerId,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load resource.' });
  }
});

// POST /api/resources - Create new listing
resourcesRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, category, description, price, condition, image } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Resource title is required.' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Resource description is required.' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number. Free listings are not permitted.' });
    }

    if (!VALID_CONDITIONS.includes(condition)) {
      return res.status(400).json({
        error: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}`,
      });
    }

    // Image size check (max ~3MB base64 data URL)
    if (image && typeof image === 'string' && image.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds maximum limit (2.5MB).' });
    }

    const newResource = await db.resource.create({
      title: title.trim(),
      category,
      description: description.trim(),
      price: numPrice,
      condition,
      image: image || '',
      sellerId: req.session!.userId!,
      campusId: req.session!.campusId!,
    });

    return res.status(201).json({
      message: 'Resource listed successfully!',
      resource: newResource,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create resource listing.' });
  }
});

// PUT /api/resources/:id - Edit own listing (only before sold)
resourcesRouter.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await db.resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    // Verify ownership
    if (resource.seller._id.toString() !== req.session!.userId!) {
      return res.status(403).json({ error: 'You are not authorized to edit this listing.' });
    }

    // If sold, it is read-only
    if (resource.status === 'Sold') {
      return res.status(400).json({
        error: 'This resource has already been sold and can no longer be edited.',
      });
    }

    const { title, category, description, price, condition, image } = req.body;

    const updates: any = {};
    if (title && title.trim()) updates.title = title.trim();
    if (category && VALID_CATEGORIES.includes(category)) updates.category = category;
    if (description && description.trim()) updates.description = description.trim();
    if (condition && VALID_CONDITIONS.includes(condition)) updates.condition = condition;

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number.' });
      }
      updates.price = numPrice;
    }

    if (image !== undefined) {
      if (image && image.length > 4 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image size exceeds maximum limit.' });
      }
      updates.image = image;
    }

    const updated = await db.resource.update(id, updates);
    return res.json({
      message: 'Resource updated successfully.',
      resource: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update resource.' });
  }
});

// DELETE /api/resources/:id - Delete own listing (only before sold)
resourcesRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await db.resource.findById(id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    // Verify ownership
    if (resource.seller._id.toString() !== req.session!.userId!) {
      return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
    }

    // If sold, cannot delete
    if (resource.status === 'Sold') {
      return res.status(400).json({
        error: 'This resource has already been sold and cannot be deleted.',
      });
    }

    await db.resource.delete(id);
    return res.json({ message: 'Resource listing permanently deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete resource.' });
  }
});
