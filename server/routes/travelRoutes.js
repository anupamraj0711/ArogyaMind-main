import express from 'express';
import { getHotelRecommendations } from '../controllers/travelController.js';

const router = express.Router();

router.post('/hotels', getHotelRecommendations);

export default router;
