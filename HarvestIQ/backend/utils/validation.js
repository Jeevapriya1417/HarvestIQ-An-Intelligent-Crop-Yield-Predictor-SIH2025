// Prediction input validation
import Joi from 'joi';

// Define schema for prediction input validation
export const predictionInputSchema = Joi.object({
  area: Joi.number().min(0.1).max(1000).required().label('Farm Area'),
  rainfall: Joi.number().min(100).max(5000).required().label('Annual Rainfall'),
  ph: Joi.number().min(3).max(10).required().label('Soil pH'),
  nitrogen: Joi.number().min(0).max(300).required().label('Nitrogen'),
  phosphorus: Joi.number().min(0).max(150).required().label('Phosphorus'),
  potassium: Joi.number().min(0).max(200).required().label('Potassium'),
  organic: Joi.number().min(0).max(10).required().label('Organic Content'),
  crop: Joi.string().required().label('Crop Type'),
  season: Joi.string().required().label('Season'),
  state: Joi.string().required().label('Region/State')
});

// Validate prediction input data
export const validatePredictionInput = (data) => {
  return predictionInputSchema.validate(data, { abortEarly: false });
};