import mongoose from 'mongoose';

const symptomRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  symptoms: { type: String, required: true },
  aiAnalysis: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

export default mongoose.model('SymptomRecord', symptomRecordSchema);
