import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import Role from './models/Role.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agentic-care')
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Seed initial roles
    const roles = ['Patient', 'Specialist', 'Primary Care Physician', 'Super Admin'];
    for (const roleName of roles) {
      const exists = await Role.findOne({ name: roleName });
      if (!exists) {
        await Role.create({ name: roleName });
      }
    }
    console.log('Roles seeded/verified.');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

import authRoutes from './routes/authRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import specialistRoutes from './routes/specialistRoutes.js';
import travelRoutes from './routes/travelRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specialists', specialistRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Agentic Care API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
