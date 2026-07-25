// user.routes.js
import { Router } from 'express';
import { updateProfile, getSavedProperties, getRecentlyViewed, getPublicProfile, getDashboardStats } from '../controllers/user.controller.js';
import { authorize, protect } from '../middleware/auth.js';

import { uploadMiddleware as upload } from '../services/storage/index.js';
const router = Router();
router.get('/saved', protect, getSavedProperties);
router.get('/recently-viewed', protect, getRecentlyViewed);
router.get('/dashboard', protect, authorize('owner', 'admin'), getDashboardStats);
router.get('/:id', getPublicProfile);
router.put('/profile', protect, upload.single("avatar"), updateProfile);
export default router;
