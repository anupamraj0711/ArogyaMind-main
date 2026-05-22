import mongoose from 'mongoose';

const specialistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor_id: { type: String, unique: true },
  specialty: { type: String, required: true },
  hospital: { type: String },
  city: { type: String },
  experience_years: { type: Number },
  rating: { type: Number },
  consultation_fee: { type: Number },
  available_timings: { type: String },
  languages_spoken: { type: String },
  online_available: { type: Boolean },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  availableSlots: [{ type: Date }]
}, { timestamps: true });

export default mongoose.model('Specialist', specialistSchema);
