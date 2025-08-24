const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get images
router.get('/', auth, async (req, res) => {
  try {
    const { folderId, search } = req.query;
    let query = { owner: req.user._id };

    if (folderId) {
      query.folder = folderId;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const images = await Image.find(query)
      .populate('folder', 'name path')
      .sort({ createdAt: -1 });

    res.json(images);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { name, folderId, description, tags } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Image name is required' });
    }

    // Validate folder if provided
    let folder = null;
    if (folderId) {
      folder = await Folder.findOne({ 
        _id: folderId, 
        owner: req.user._id 
      });
      
      if (!folder) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Folder not found' });
      }
    }

    const image = new Image({
      name: name.trim(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder: folderId || null,
      owner: req.user._id,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    });

    await image.save();
    await image.populate('folder', 'name path');

    res.status(201).json(image);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete image
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.deleteOne({ _id: image._id });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;