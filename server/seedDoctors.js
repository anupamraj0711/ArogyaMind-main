import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Specialist from './models/Specialist.js';
import Role from './models/Role.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    const filePath = path.join(__dirname, '../doctors.json');
    const doctorsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Ensure Specialist role exists
    let specialistRole = await Role.findOne({ name: 'Specialist' });
    if (!specialistRole) {
      specialistRole = await Role.create({ name: 'Specialist' });
    }

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    for (const doc of doctorsData) {
      // Create user account for doctor
      const email = `${doc.doctor_id.toLowerCase()}@agenticcare.com`;
      
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: doc.doctor_name,
          email,
          password: hashedPassword,
          role: specialistRole._id
        });
      }

      // Create or update Specialist profile
      await Specialist.findOneAndUpdate(
        { doctor_id: doc.doctor_id },
        {
          user: user._id,
          doctor_id: doc.doctor_id,
          specialty: doc.specialization,
          hospital: doc.hospital,
          city: doc.city,
          experience_years: doc.experience_years,
          rating: doc.rating,
          consultation_fee: doc.consultation_fee,
          available_timings: doc.available_timings,
          languages_spoken: doc.languages_spoken,
          online_available: doc.online_available
        },
        { upsert: true, new: true }
      );
    }

    console.log('Successfully seeded all doctors from dataset!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
