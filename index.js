import conncetDB from "./config/db.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import blogRouter from "./routes/blog.routes.js";


dotenv.config();

const app = express();


const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,

};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRouter);
app.use("/api/blog", blogRouter);
app.get("/", (req, res) => {
  res.json({ message: "server started successfully.." })
});

// Catch-all for unmatched routes (404 handler)
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      name: 'NotFoundError',
      status: 404,
      message: `Route not found: ${req.originalUrl}`
    }
  });
});

conncetDB();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
})
