const express = require('express');
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all folders for user
router.get('/', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id })
      .populate('parentFolder', 'name')
      .sort({ createdAt: -1 });
    
    res.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create folder
router.post('/', auth, async (req, res) => {
  try {
    const { name, parentFolder, color } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // Build path
    let path = name;
    if (parentFolder) {
      const parent = await Folder.findOne({ 
        _id: parentFolder, 
        owner: req.user._id 
      });
      
      if (!parent) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      
      path = `${parent.path}/${name}`;
    }

    const folder = new Folder({
      name: name.trim(),
      parentFolder: parentFolder || null,
      owner: req.user._id,
      path,
      color: color || '#3b82f6'
    });

    await folder.save();
    await folder.populate('parentFolder', 'name');

    res.status(201).json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Folder with this name already exists in this location' });
    }
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete folder
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if folder has subfolders
    const subfolders = await Folder.find({ parentFolder: folder._id });
    if (subfolders.length > 0) {
      return res.status(400).json({ message: 'Cannot delete folder with subfolders' });
    }

    await Folder.deleteOne({ _id: folder._id });
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;