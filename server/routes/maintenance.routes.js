import { Router } from 'express';
import { createComplaint, getComplaints, updateComplaintStatus } from '../controllers/maintenance.controller.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, getComplaints);
router.post('/', protect, createComplaint);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateComplaintStatus);
router.patch('/:id/status', protect, authorize('owner', 'admin'), updateComplaintStatus);
export default router;
