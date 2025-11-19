import express from "express";
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

const sanitize = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  delete obj.__v;
  return obj;
};

const normalizeEmail = (body) => {
  const raw = (body.email || body.emailId || "").toString().trim().toLowerCase();
  return raw || null;
};
const normalizeName = (body) => {
  const raw = (body.fullName || body.FullName || "").toString().trim();
  return raw || null;
};
const normalizeRole = (body) => {
  const raw = (body.role || "").toString().trim().toLowerCase();
  return raw || null;
};

// ---------- SIGNUP ----------
authRouter.post("/signup", async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Request body required" });

    const fullName = normalizeName(req.body);
    const email = normalizeEmail(req.body);
    const password = req.body.password;
    const role = normalizeRole(req.body);

    if (!fullName || fullName.length < 3) return res.status(422).json({ error: "Full name is required (min 3 chars)" });
    if (!email || !email.includes("@")) return res.status(422).json({ error: "Valid email is required" });
    if (!password || typeof password !== "string" || password.length < 6) return res.status(422).json({ error: "Password must be at least 6 characters" });
    if (!role || !["user", "doctor", "admin"].includes(role)) return res.status(400).json({ error: "Invalid or missing role. Use 'user', 'doctor' or 'admin' in request body" });

    const Model = TYPE_MAP[role];

    const existing = await Model.findOne({ emailId: email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const doc = new Model({
      fullName,
      emailId: email,
      password: passwordHash,
    });

    const saved = await doc.save();

    const payload = { sub: saved._id.toString(), type: role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ message: `${role} created`, data: sanitize(saved), token });
  } catch (err) {
    console.error("signup error:", err);
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    if (err && err.message) return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- LOGIN ----------
authRouter.post("/login", async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Request body required" });

    const email = normalizeEmail(req.body);
    const password = req.body.password;
    const role = normalizeRole(req.body);

    if (!email || !password) return res.status(422).json({ error: "email and password are required" });
    if (!role || !["user", "doctor", "admin"].includes(role)) return res.status(400).json({ error: "Invalid or missing role. Use 'user', 'doctor' or 'admin' in request body" });

    const Model = TYPE_MAP[role];

    const user = await Model.findOne({ emailId: email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { sub: user._id.toString(), type: role };
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
    if (err && err.code === 11000) return res.status(409).json({ error: "Email already registered" });
    if (err && err.message) return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default authRouter;
