// ai.js
import express from 'express';
import { getAvailableModels, runPrediction } from '../controllers/aiController.js';

const router = express.Router();

// Get available AI models
router.get('/models', getAvailableModels);

// Run AI prediction
router.post('/predict', runPrediction);

export default router;