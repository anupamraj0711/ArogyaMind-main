import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI.');
}

mongoose.connect(mongoUri).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({name: /Virat/}).toArray();
  console.log('Users:', users);
  const apps = await db.collection('appointments').find({}).toArray();
  console.log('Appointments:', apps);
  mongoose.connection.close();
});
