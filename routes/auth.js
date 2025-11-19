import express from "express";
import validateSignUpData from "../utils/Validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

const authRouter = express.Router();

const TYPE_MAP = {
  admin: Admin,
  user: User,
  doctor: Doctor,
};

const JWT_SECRET = process.env.JWT_SECRET || "replace_me_in_env";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "1d";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// helper to remove sensitive fields
const sanitize = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  return obj;
};

// --------- SIGNUP (POST /api/auth/:type/signup) ----------
authRouter.post("/:type/signup", async (req, res) => {
  try {
    const { type } = req.params;
    const Model = TYPE_MAP[type];
    if (!Model) return res.status(400).json({ error: "Invalid type. Use admin|user|doctor" });

    // run your validation util (assumed to throw on invalid)
    validateSignUpData(req);

    // support both FullName and fullName field names
    const { FullName, fullName, emailId, password } = req.body;
    const name = (fullName || FullName || "").trim();
    if (!name) return res.status(422).json({ error: "Full name is required" });

    if (!emailId || !emailId.includes("@")) return res.status(422).json({ error: "Valid emailId is required" });
    if (!password || password.length < 6) return res.status(422).json({ error: "Password must be at least 6 characters" });

    // check duplicate within chosen model
    const existing = await Model.findOne({ emailId: emailId.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const doc = new Model({
      fullName: name,
      emailId: emailId.toLowerCase(),
      password: passwordHash,
    });

    const saved = await doc.save();

    const payload = { sub: saved._id.toString(), type };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ message: `${type} created`, data: sanitize(saved) });
  } catch (err) {
    console.error("signup error:", err);
    // if your validateSignUpData throws with message, return that
    if (err && err.message) return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------- LOGIN (POST /api/auth/:type/login) ----------
authRouter.post("/:type/login", async (req, res) => {
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

    const payload = { sub: user._id.toString(), type };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);
    return res.json({ message: "Login successful", data: sanitize(user), token });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default authRouter;
