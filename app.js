import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./middlewares/error.middleware.js";
import jwt from "jsonwebtoken";

const app = express();
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

// ✅ Middlewares (Order is Important)
app.use(cors({
  origin: "https://lms-5.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Place before routes
app.use(morgan("dev"));

// ✅ Set Cookie Route (Test Route)
app.get("/set-cookie", (req, res) => {
    if (!SECRET_KEY) {
        return res.status(500).json({ error: "JWT_SECRET is not defined in environment variables" });
    }

    // Mock user (Replace with real database user)
    const user = { _id: "123456789", role: "user" };

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { 
        expiresIn: process.env.JWT_EXPIRY 
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
    });

    res.json({ message: "JWT Cookie set!", token });
});

// ✅ Check Cookie Route
app.get("/check-cookie", (req, res) => {
    console.log("Received Cookies:", req.cookies); // Debugging
    
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "No cookie found!" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid token!" });
        }
        res.json({ success: true, message: "Cookie is valid!", user: decoded });
    });
});

// ✅ Import Routes
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import miscRoutes from "./routes/miscellaneous.routes.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/misc", miscRoutes);

// ✅ Default 404 Route
app.all("*", (_req, res) => {
  res.status(404).json({ error: "OOPS!!! 404 Page Not Found" });
});

// ✅ Custom Error Middleware
app.use(errorMiddleware);

export default app;
