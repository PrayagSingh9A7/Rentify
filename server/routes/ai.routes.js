import { Router } from 'express';
import { localityAdvisor, expensePredictor, getRecommendations } from '../controllers/ai.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();
router.post('/locality-advisor', localityAdvisor);
router.post('/expense-predictor', expensePredictor);
router.get('/recommendations', optionalAuth, getRecommendations);
export default router;