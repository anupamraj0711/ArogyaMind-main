import express from 'express';
import { createAppointment, getMyAppointments, updateAppointment } from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/:patientId', getMyAppointments);
router.put('/:id', updateAppointment);

export default router;
