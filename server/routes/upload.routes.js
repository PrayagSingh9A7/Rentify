import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.post('/images', protect, upload.array('images', 10), (req, res) => {
  const urls = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  res.json({ success: true, data: urls });
});

router.post('/avatar', protect, upload.single('avatar'), (req, res) => {
  res.json({ success: true, data: { url: req.file.path, publicId: req.file.filename } });
});

export default router;