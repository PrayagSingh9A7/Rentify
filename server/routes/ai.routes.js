import { Router } from 'express';
import { localityAdvisor, expensePredictor, getRecommendations, propertyRecommender } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.post('/locality-advisor', localityAdvisor);
router.post('/expense-predictor', expensePredictor);
router.post('/property-recommender', propertyRecommender);
router.get('/recommendations', optionalAuth, getRecommendations);
export default router;
