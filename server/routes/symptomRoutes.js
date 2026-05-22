import express from 'express';
import { analyzeSymptoms, getSymptomHistory } from '../controllers/symptomController.js';

const router = express.Router();

router.post('/analyze', analyzeSymptoms);
router.get('/history/:patientId', getSymptomHistory);

export default router;
