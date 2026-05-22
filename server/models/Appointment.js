import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialist: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialist', required: true },
  symptomRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'SymptomRecord' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
