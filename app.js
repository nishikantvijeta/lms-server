import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();
dotenv.config();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ CORS Setup
app.use(
  cors({
    origin: "https://lms-5.vercel.app/", // ✅ Allow only your frontend
    credentials: true, // ✅ Required for cookies/sessions
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Add allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Add necessary headers
  })
);

app.options("*", cors());
app.use(cookieParser());
app.use(morgan('dev'));
// ✅ Server Status Route
app.get('/ping', (_req, res) => {
  res.send('Pong');
});

// ✅ Import Routes
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/misc', miscRoutes);

// ✅ Default 404 Route
app.all('*', (_req, res) => {
  res.status(404).json({ error: 'OOPS!!! 404 Page Not Found' });
});

// ✅ Custom Error Middleware
app.use(errorMiddleware);

export default app;
