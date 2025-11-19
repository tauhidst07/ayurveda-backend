import mongoose from "mongoose";
import validator from "validator";

const DoctorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true,minLength : 3,
        maxLength : 50
     },
    emailId: { type: String, required: true, trim: true, unique: true, lowercase: true,
      validate: {
      validator: (v) => validator.isEmail(v),
      message: "Invalid email",
    }, },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
