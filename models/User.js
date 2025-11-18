import mongoose  from "mongoose";
import validator from "validator"

const userSchema =  new mongoose.Schema({

    FullName: {
   type : String,
    required: true,
    minLength : 3,
    maxLength : 20
    },

    emailId: {
   type : String,
    required: true,
    lowercase :true,
    trim : true,
    unique : true,
    },

    password: {
     type : String,
     require: true,
}, 
    

    
},{timestamps:true,});

export default mongoose.model("User", userSchema);