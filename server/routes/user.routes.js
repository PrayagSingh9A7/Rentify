// user.routes.js
import { Router } from 'express';
import { updateProfile, getSavedProperties, getRecentlyViewed, getPublicProfile, getDashboardStats } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();
router.get('/saved', protect, getSavedProperties);
router.get('/recently-viewed', protect, getRecentlyViewed);
router.get('/dashboard', protect, getDashboardStats);
router.get('/:id', getPublicProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
export default router;