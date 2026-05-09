// auth.routes.js
import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
export default router;