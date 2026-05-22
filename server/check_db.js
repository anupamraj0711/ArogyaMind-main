import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agentic_care').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({name: /Virat/}).toArray();
  console.log('Users:', users);
  const apps = await db.collection('appointments').find({}).toArray();
  console.log('Appointments:', apps);
  mongoose.connection.close();
});
