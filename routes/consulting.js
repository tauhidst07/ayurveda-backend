import express from "express";
import Doctor from "../models/Doctor.js";
import userAuth from "../middleware/auth.js";

const consultRouter = express.Router();


consultRouter.get("/doctor/:id/consult-info",userAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      id: doctor._id,
      name: doctor.name,
      avatar: doctor.avatar,
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      experience: doctor.experience,
      rating: doctor.rating,
      reviews: doctor.reviews,
      fee: doctor.fee,
      slots: doctor.slots 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default consultRouter;
