import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

const TYPE_MAP = {
  admin: Admin,
  user: User,
  doctor: Doctor,
};

const JWT_SECRET = process.env.JWT_SECRET || "replace_me_in_env";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "1d";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

const sanitize = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  return obj;
};

function validateSignupBody(body) {
  const { fullName, emailId, password } = body;
  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return "fullName is required";
  }
  if (!emailId || typeof emailId !== "string" || !emailId.includes("@")) {
    return "valid emailId is required";
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return "password (min 6 chars) is required";
  }
  return null;
}

router.post("/:type/signup", async (req, res) => {
  try {
    const { type } = req.params;
    const Model = TYPE_MAP[type];
    if (!Model) return res.status(400).json({ error: "Invalid type. Use admin|user|doctor" });

    const err = validateSignupBody(req.body);
    if (err) return res.status(422).json({ error: err });

    const { fullName, FullName, emailId, password } = req.body;
    const finalName = fullName || FullName;

    const existing = await Model.findOne({ emailId: (emailId || "").toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const doc = new Model({
      fullName: finalName,
      emailId: (emailId || "").toLowerCase(),
      password: passwordHash,
    });

    const saved = await doc.save();

    const tokenPayload = { sub: saved._id.toString(), type };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000, 
    };

    res.cookie("token", token, cookieOptions);
    res.status(201).json({ message: `${type} created`, data: sanitize(saved) });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ROUTE: POST /api/auth/:type/login
router.post("/:type/login", async (req, res) => {
  try {
    const { type } = req.params;
    const Model = TYPE_MAP[type];
    if (!Model) return res.status(400).json({ error: "Invalid type. Use admin|user|doctor" });

    const { emailId, password } = req.body;
    if (!emailId || !password) return res.status(422).json({ error: "emailId and password are required" });

    const user = await Model.findOne({ emailId: emailId.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const tokenPayload = { sub: user._id.toString(), type };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);
    res.json({ message: "Login successful", data: sanitize(user), token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
