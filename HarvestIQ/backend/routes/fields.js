import express from 'express';
import Field from '../models/Field.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/fields
// @desc    Create new field
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      name,
      coordinates,
      size,
      soilType,
      soilData,
      description,
      currentCrop
    } = req.body;

    // Validate required fields
    if (!name || !coordinates || !size) {
      return res.status(400).json({
        success: false,
        message: 'Name, coordinates, and size are required',
        errors: ['Missing required fields']
      });
    }

    // Create new field
    const field = new Field({
      userId: req.user.id,
      name,
      coordinates,
      size,
      soilType,
      soilData,
      description,
      currentCrop
    });

    await field.save();

    res.status(201).json({
      success: true,
      data: field,
      message: 'Field created successfully'
    });

  } catch (error) {
    console.error('Create field error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create field'
    });
  }
});

// @route   GET /api/fields
// @desc    Get all fields for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const fields = await Field.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: fields,
      count: fields.length,
      message: 'Fields retrieved successfully'
    });

  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fields'
    });
  }
});

// @route   GET /api/fields/:id
// @desc    Get single field by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const field = await Field.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      data: field,
      message: 'Field retrieved successfully'
    });

  } catch (error) {
    console.error('Get field error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve field'
    });
  }
});

// @route   PUT /api/fields/:id
// @desc    Update field
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      coordinates,
      size,
      soilType,
      soilData,
      description,
      currentCrop
    } = req.body;

    const field = await Field.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Update field data
    if (name !== undefined) field.name = name;
    if (coordinates !== undefined) field.coordinates = coordinates;
    if (size !== undefined) field.size = size;
    if (soilType !== undefined) field.soilType = soilType;
    if (soilData !== undefined) field.soilData = soilData;
    if (description !== undefined) field.description = description;
    if (currentCrop !== undefined) field.currentCrop = currentCrop;

    field.updatedAt = new Date();

    await field.save();

    res.json({
      success: true,
      data: field,
      message: 'Field updated successfully'
    });

  } catch (error) {
    console.error('Update field error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update field'
    });
  }
});

// @route   DELETE /api/fields/:id
// @desc    Delete field
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const field = await Field.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    await Field.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Field deleted successfully'
    });

  } catch (error) {
    console.error('Delete field error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete field'
    });
  }
});

export default router;