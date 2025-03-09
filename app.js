import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import errorMiddleware from './middlewares/error.middleware.js';

config(); // ✅ Correct placement

const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(morgan('dev'));

// ✅ Securely set JWT token in a cookie
app.get('/set-cookie', (req, res) => {
    const user = { _id: "123456", role: "admin" }; // Mock user for testing

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "JWT_SECRET is missing in .env file" });
    }

    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "1h",
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ Secure only in production
        sameSite: "None",
        path: "/",
    });

    res.json({ message: "JWT Cookie set!", token });
});

// ✅ Check if JWT cookie is valid
app.get('/check-cookie', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "No cookie found!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid token!" });
        }
        res.json({ success: true, message: "Cookie is valid!", user: decoded });
    });
});

// ✅ Routes
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', miscRoutes);

// ✅ 404 Route
app.all('*', (_req, res) => {
  res.status(404).send('OOPS!!! 404 Page Not Found');
});

// ✅ Error Middleware
app.use(errorMiddleware);

export default app;

