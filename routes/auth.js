import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import user from "../models/User.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

const TYPE_MAP = {
  admin: Admin,
  user: user,
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

    const existingUser = await User.findOne({ emailId });
     if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
     }



     const user = new user({
        FullName,
        emailId,
        password: passwordHash,
     });
      const savedUser=  await user.save();
    const token = await jwt.sign({_id: user._id}, "Monik@2002")

        res.cookie("token", token);

       res.json({ message: "User Added Successfully", data: savedUser });
    }catch(err){
        res.status(400).send("ERROR: " + err.message);
     };
   


});

authRouter.post("/login", async(req,res)=>{
    try{
     const {emailId, password} = req.body;
     const user = await User.findOne({emailId : emailId})
     if(!user){
        throw new Error("invalide emailId and password");
     }
     const isPasswordValid =  await bcrypt.compare(password, user.password)

     if(isPasswordValid){
       

        const token = await jwt.sign({_id: user._id}, "process.env.JWT_SECRET")
       
        res.cookie("token", token);
        res.send(user);
     }
     else{
        throw new Error("invalide emailId and password")
     }
    }catch(err){
        res.status(400).send("ERROR:" + err.message);
}

});

export default router;
