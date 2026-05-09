import { Router } from 'express';
import {
  getProperties, getProperty, createProperty, updateProperty,
  deleteProperty, toggleSaveProperty, getOwnerProperties,
  getFeaturedProperties, updateAvailabilityCalendar, addPropertyImages,
} from '../controllers/property.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/owner/my-listings', protect, getOwnerProperties);
router.get('/:id', optionalAuth, getProperty);
router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/:id/save', protect, toggleSaveProperty);
router.put('/:id/calendar', protect, updateAvailabilityCalendar);
router.post('/:id/images', protect, upload.array('images', 10), addPropertyImages);

export default router;