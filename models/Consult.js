import mongoose from "mongoose";

const ConsultSchema = new mongoose.Schema({
  name: { type: String },
  avatar: { type: String },
  qualification: { type: String },
  specialization: [String],   
  experience: { type: String },
  rating: Number,
  reviews: Number,
  fee: {
    chat: Number,
    voice: Number,
    video: Number
  },
  slots: {
    type: Map,
    of: [String]  //  { "2025-02-16": ["10:00 AM", "10:30 AM"] }
  }
});

export default mongoose.model("Consult", ConsultSchema);
