import conncetDB from "./config/db.js";
import express from "express"; 
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); 

const app = express();   

// middleware
app.use(cors());
app.use(express.json()); 

app.get("/",(req,res)=>{
    res.json({message:"server started successfully.."})
}) 

conncetDB();
const PORT = process.env.PORT || 4000; 

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})
