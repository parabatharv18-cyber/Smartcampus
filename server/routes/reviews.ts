import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const reviewsRouter = Router();

function requireAuth(req: Request, res: Response, next: () => void) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Please log in to perform this action.' });
  }
  next();
}

// POST /api/reviews - Buyer leaves a review for a completed transaction
reviewsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { requestId, rating, comment } = req.body;
    const buyerId = req.session!.userId!;
    const campusId = req.session!.campusId!;

    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'A short written review comment is required.' });
    }

    // Find the request
    const request = await db.request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Transaction request not found.' });
    }

    // Only the buyer can review
    if (request.buyer.toString() !== buyerId) {
      return res.status(403).json({
        error: 'Only the buyer in this completed transaction can submit a review.',
      });
    }

    // Must be completed
    if (request.status !== 'Completed') {
      return res.status(400).json({
        error: 'A review can only be submitted after the transaction has been marked as Completed.',
      });
    }

    // Prevent duplicate reviews for the same transaction
    const existingReview = await db.review.findByRequest(requestId);
    if (existingReview) {
      return res.status(400).json({
        error: 'You have already submitted a review for this transaction.',
      });
    }

    const newReview = await db.review.create({
      sellerId: request.seller.toString(),
      buyerId,
      resourceId: request.resource.toString(),
      requestId,
      rating: Math.round(numRating),
      comment: comment.trim(),
      campusId,
    });

    return res.status(201).json({
      message: 'Review submitted successfully! Thank you for helping our campus community.',
      review: newReview,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit review.' });
  }
});

// GET /api/reviews/seller/:sellerId - Get reviews for a seller
reviewsRouter.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const reviews = await db.review.findBySeller(sellerId);
    const stats = await db.review.getSellerStats(sellerId);

    return res.json({
      reviews,
      stats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch reviews.' });
  }
});

// POST /api/reviews/:id/report - Report a review
reviewsRouter.post('/:id/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reportedById = req.session!.userId!;
    const campusId = req.session!.campusId!;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please provide a reason for reporting this review.' });
    }

    const report = await db.report.create({
      reviewId: id,
      reportedById,
      reason: reason.trim(),
      campusId,
    });

    return res.status(201).json({
      message: 'Review has been reported and logged in the database for campus record.',
      reportId: report._id,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to report review.' });
  }
});
