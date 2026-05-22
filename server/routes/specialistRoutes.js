import express from 'express';
import { getAllSpecialists } from '../controllers/specialistController.js';

const router = express.Router();

router.get('/', getAllSpecialists);

export default router;
