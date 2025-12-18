import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import protectedRoutes from './routes/protectedRoutes.js';
import fileRoutes from "./routes/fileRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];
  
app.use(cors({
  origin: allowedOrigins,
  credentials: true //?
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use('/api/v1', protectedRoutes)

app.use('/api/v1/files', fileRoutes)

app.listen(PORT, () => {
  console.log(`API running on port:${PORT}`);
});
