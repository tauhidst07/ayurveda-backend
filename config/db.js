import mongoose from "mongoose"; 
import dotenv from "dotenv"; 
dotenv.config();
console.log("mongo url: ",process.env.MONGO_URL)
const conncetDB = async ()=>{
    try{
    const connection = mongoose.connect(process.env.MONGO_URL); 
    console.log("Database connected");
    }
    catch(err){
        console.log("Mongodb connection error",err.message)
    }
} 

export default conncetDB;