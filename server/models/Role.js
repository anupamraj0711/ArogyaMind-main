import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Patient', 'Specialist', 'Primary Care Physician', 'Super Admin']
  }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
