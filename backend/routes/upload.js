const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    const name = `${base}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// @route POST /api/upload
// @desc  Upload a file (authenticated)
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(201).json({ message: 'File uploaded', fileUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;
