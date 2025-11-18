import express from "express";
import  validateSignUpData  from "../utils/validation.js";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";


const authRouter = express.Router();


authRouter.post("/signup", async(req,res)=>{

    try{   
    validateSignUpData(req);

    const{ FullName ,emailId,password} = req.body;
    const passwordHash = await bcrypt.hash(password,10);

    const existingUser = await User.findOne({ emailId });
     if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
     }



     const user = new User({
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

export default authRouter;
