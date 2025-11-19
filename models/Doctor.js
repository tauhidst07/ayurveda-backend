import mongoose from "mongoose";
import validator from "validator";

const DoctorSchema = new mongoose.Schema(
  {
    fullName: { 
      type: String, 
      required: true, 
      trim: true,
      minLength: 3,
      maxLength: 50 
    },

    emailId: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email",
      },
    },

    password: { 
      type: String, 
      required: true 
    },
    
    avatar: { type: String, default: "" },
    qualification: { type: String, default: "" },
    specialization: { type: [String], default: [] },
    experience: { type: String, default: "" },

    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },

    fee: {
      chat: { type: Number, default: 0 },
      voice: { type: Number, default: 0 },
      video: { type: Number, default: 0 }
    },

  
    slots: {
      type: Map,
      of: [String],  
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
