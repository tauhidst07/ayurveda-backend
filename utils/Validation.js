import validator from "validator";

export default function validateSignUpData(req) {
  const body = req.body || {};

  const fullNameRaw = (body.fullName || body.FullName || "").toString().trim();
  if (!fullNameRaw) {
    throw new Error("Full name is required");
  }
  if (fullNameRaw.length < 3) {
    throw new Error("Full name must be at least 3 characters");
  }
  const emailRaw = (body.email || body.emailId || "").toString().trim().toLowerCase();
  if (!emailRaw) {
    throw new Error("Email is required");
  }
  if (typeof emailRaw !== "string" || !validator.isEmail(emailRaw)) {
    throw new Error("Invalid email");
  }

  const password = body.password;
  const confirmPassword = body.confirmPassword;
  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  if (typeof confirmPassword !== "undefined") {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
  }

  const roleRaw = (body.role || "").toString().trim().toLowerCase();
  if (!roleRaw || !["user", "doctor", "admin"].includes(roleRaw)) {
    throw new Error("Role is required and must be one of: user, doctor, admin");
  }

  return {
    fullName: fullNameRaw,
    email: emailRaw,
    password,
    role: roleRaw,
  };
}
