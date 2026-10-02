import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const requestsRouter = Router();

function requireAuth(req: Request, res: Response, next: () => void) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Please log in to perform this action.' });
  }
  next();
}

// POST /api/requests - Create a request for an available resource
requestsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body;
    const buyerId = req.session!.userId!;
    const campusId = req.session!.campusId!;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required.' });
    }

    const resource = await db.resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    // Verify campus isolation
    if (resource.campus.toString() !== campusId) {
      return res.status(403).json({ error: 'You cannot request resources from another campus.' });
    }

    // Buyer cannot be the seller
    if (resource.seller._id.toString() === buyerId) {
      return res.status(400).json({ error: 'You cannot request your own listed resource.' });
    }

    // Cannot request sold resources
    if (resource.status === 'Sold') {
      return res.status(400).json({ error: 'This resource is already sold.' });
    }

    // Check for existing pending request
    const existing = await db.request.findExistingPending(buyerId, resourceId);
    if (existing) {
      return res.status(400).json({
        error: 'You already have a pending request for this resource. Please wait for the seller to respond.',
      });
    }

    const newRequest = await db.request.create({
      buyerId,
      sellerId: resource.seller._id.toString(),
      resourceId,
      price: resource.price,
      campusId,
    });

    return res.status(201).json({
      message: 'Request submitted to seller successfully!',
      request: newRequest,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit request.' });
  }
});

// GET /api/requests/my - Buyer's requests
requestsRouter.get('/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const buyerId = req.session!.userId!;
    const requests = await db.request.findByBuyer(buyerId);

    // Check which completed requests have already been reviewed by this buyer
    const enriched = await Promise.all(
      requests.map(async (r) => {
        let isReviewed = false;
        if (r.status === 'Completed') {
          const review = await db.review.findByRequest(r._id.toString());
          isReviewed = !!review;
        }
        return {
          ...r,
          isReviewed,
        };
      })
    );

    return res.json({ requests: enriched });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch requests.' });
  }
});

// GET /api/requests/seller - Seller's received requests for their listings
requestsRouter.get('/seller', requireAuth, async (req: Request, res: Response) => {
  try {
    const sellerId = req.session!.userId!;
    const requests = await db.request.findBySeller(sellerId);
    return res.json({ requests });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch seller requests.' });
  }
});

// POST /api/requests/:id/accept - Seller accepts a request
requestsRouter.post('/:id/accept', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = req.session!.userId!;

    const request = await db.request.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    // Verify user is the seller
    if (request.seller.toString() !== sellerId) {
      return res.status(403).json({ error: 'Only the seller can accept this request.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        error: `Cannot accept request with status "${request.status}". Only pending requests can be accepted.`,
      });
    }

    // Verify resource is still available
    const resource = await db.resource.findById(request.resource.toString());
    if (!resource || resource.status === 'Sold') {
      return res.status(400).json({
        error: 'This resource is already marked as Sold.',
      });
    }

    // Accept this request, mark resource Sold, reject all other pending requests
    await db.request.acceptRequest(id, request.resource.toString());

    return res.json({
      message: 'Request accepted! Resource is now marked as Sold, and other pending requests have been rejected.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to accept request.' });
  }
});

// POST /api/requests/:id/reject - Seller rejects an individual pending request
requestsRouter.post('/:id/reject', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = req.session!.userId!;

    const request = await db.request.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.seller.toString() !== sellerId) {
      return res.status(403).json({ error: 'Only the seller can reject this request.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending requests can be rejected.' });
    }

    await db.request.rejectRequest(id);

    return res.json({ message: 'Request rejected.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to reject request.' });
  }
});

// POST /api/requests/:id/complete - Buyer marks transaction completed
requestsRouter.post('/:id/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const buyerId = req.session!.userId!;

    const request = await db.request.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    // Only buyer can mark the transaction completed
    if (request.buyer.toString() !== buyerId) {
      return res.status(403).json({
        error: 'Only the buyer who requested this item can mark the transaction as completed.',
      });
    }

    if (request.status !== 'Accepted') {
      return res.status(400).json({
        error: 'Transaction can only be marked as completed after the seller has accepted your request.',
      });
    }

    await db.request.completeRequest(id);

    return res.json({
      message: 'Transaction marked as completed! You can now leave a seller review.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to complete transaction.' });
  }
});
