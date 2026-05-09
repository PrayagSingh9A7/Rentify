// review.routes.js
import { Router } from 'express';
import { getPropertyReviews, createReview, addOwnerResponse } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/:propertyId', getPropertyReviews);
router.post('/:propertyId', protect, createReview);
router.post('/:reviewId/response', protect, addOwnerResponse);
export default router;