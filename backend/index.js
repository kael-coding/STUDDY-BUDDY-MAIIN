import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import sched_taskRoutes from './routes/sched_task.route.js';
import noteRoutes from './routes/notes.Routes.js';

import scheduler from '../backend/cron/scheduler.js';
import { connectDB } from './db/connectDB.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://studdy-buddy-maiin-production.up.railway.app",
        "https://studdy-buddy-maiin.onrender.com"
    ],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/schedule", sched_taskRoutes)
app.use("/api/notes", noteRoutes)


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '/frontend/dist')))

    app.get("*", (_, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });

}

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on  http://localhost:${PORT}`);
});