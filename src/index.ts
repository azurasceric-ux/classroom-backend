import express from 'express';
import subjectsRouter from "./routes/subjects";
import departmentsRouter from "./routes/departments";
import usersRouter from "./routes/users";
import classesRouter from "./routes/classes";
import cors from "cors";
import securityMiddleware from "./middleware/security";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const PORT = 8000;
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

app.all('/api/auth/*splat', securityMiddleware, toNodeHandler(auth));

app.use(express.json());

app.use('/api/subjects', subjectsRouter);

app.use('/api/departments', departmentsRouter);

app.use('/api/users', usersRouter);

app.use('/api/classes', classesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

