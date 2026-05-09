import { Router } from 'express';
import { createComplaint, getComplaints, updateComplaintStatus } from '../controllers/maintenance.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, getComplaints);
router.post('/', protect, createComplaint);
router.put('/:id/status', protect, updateComplaintStatus);
export default router;