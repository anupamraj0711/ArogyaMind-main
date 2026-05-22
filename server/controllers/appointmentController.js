import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

export const createAppointment = async (req, res) => {
  try {
    const { patientId, specialistId, symptomRecordId, date } = req.body;

    if (!patientId || !specialistId || !date) {
      return res.status(400).json({ message: 'patientId, specialistId, and date are required' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      specialist: specialistId,
      symptomRecord: symptomRecordId,
      date
    });

    const patient = await User.findById(patientId);

    // Send Email if credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' && patient) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: patient.email,
          subject: 'Appointment Confirmation - Agentic Care',
          text: `Hello ${patient.name},\n\nYour appointment is confirmed for ${new Date(date).toLocaleString()}.\n\nBest,\nAgentic Care Team`
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Do not throw, allow appointment creation to succeed
      }
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate({
        path: 'specialist',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status } = req.body;
    
    const updateData = {};
    if (date) updateData.date = date;
    if (status) updateData.status = status;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
