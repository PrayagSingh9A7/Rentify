import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { uploadMiddleware as upload } from '../services/storage/index.js';

const router = Router();

router.post('/images', protect, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: 'At least one image is required' });
  }

  const urls = req.files.map((f) => ({
    url: f.path,
    publicId: f.filename,
  }));

  res.json({
    success: true,
    data: urls,
  });
});

router.post('/avatar', protect, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Avatar image is required' });
  }

  res.json({
    success: true,
    data: {
      url: req.file.path,
      publicId: req.file.filename,
    },
  });
});

export default router;
