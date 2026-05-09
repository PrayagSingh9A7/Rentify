import { Router } from 'express';
import { getOrCreateConversation, getConversations, getMessages, sendMessage, createGroupChat } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, getOrCreateConversation);
router.post('/conversations/group', protect, createGroupChat);
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/conversations/:conversationId/messages', protect, sendMessage);
export default router;