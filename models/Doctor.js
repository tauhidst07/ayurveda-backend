import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true,minLength : 3,
        maxLength : 20
     },
    emailId: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
