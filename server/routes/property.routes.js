import { Router } from 'express';
import {
  getProperties, getProperty, createProperty, updateProperty,
  deleteProperty, toggleSaveProperty, getOwnerProperties,
  getFeaturedProperties, getHomeData, updateAvailabilityCalendar, addPropertyImages,getNearbyProperties,getSimilarProperties,
} from '../controllers/property.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { uploadMiddleware } from "../services/storage/index.js";

const router = Router();

router.get('/', getProperties);
router.get('/home-data', getHomeData);
router.get('/featured', getFeaturedProperties);
router.get('/owner/my-listings', protect, authorize('owner', 'admin'), getOwnerProperties);
router.get('/my', protect, authorize('owner', 'admin'), getOwnerProperties);
router.get("/nearby", getNearbyProperties);
router.get('/:id/nearby', getNearbyProperties);
router.get('/:id/similar', getSimilarProperties);
router.get('/:id', optionalAuth, getProperty);
router.post('/', protect, authorize('owner', 'admin'), createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/:id/save', protect, toggleSaveProperty);
router.put('/:id/calendar', protect, updateAvailabilityCalendar);
router.post(
  "/:id/images",
  protect,
  uploadMiddleware.array("images", 10),
  addPropertyImages
);

export default router;
