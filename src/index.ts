import express from 'express';
import subjectsRouter from "./routes/subjects";
import departmentsRouter from "./routes/departments";
import cors from "cors";
import securityMiddleware from "./middleware/security";

const app = express();
const PORT = 8000;
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(securityMiddleware);

app.use(express.json());

app.use('/api/subjects', subjectsRouter);

app.use('/api/departments', departmentsRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

