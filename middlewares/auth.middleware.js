import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncHandler from "./asyncHandler.middleware.js";
import User from "../models/user.model.js"; // Ensure you import the User model if needed

// Middleware to check if the user is logged in
export const isLoggedIn = asyncHandler(async (req, _res, next) => {
  // Extracting token from cookies
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Unauthorized, please login to continue", 401));
  }

  try {
    // Decoding the token using JWT verify method
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging

    // Fetch user from database to ensure valid session (recommended for security)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new AppError("User not found, please login again", 401));
    }

    req.user = user; // Store user data in req object
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return next(new AppError("Invalid or expired token, please login again", 401));
  }
});

// Middleware to check if user has the required role
export const authorizeRoles = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    console.log("User Data in authorizeRoles:", req.user); // Debugging

    if (!req.user) {
      return next(new AppError("Unauthorized, please login", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to view this route", 403));
    }

    next();
  });

// Middleware to check if user has an active subscription
export const authorizeSubscribers = asyncHandler(async (req, _res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized, please login", 401));
  }

  if (req.user.role !== "ADMIN" && req.user.subscription?.status !== "active") {
    return next(new AppError("Please subscribe to access this route.", 403));
  }

  next();
});
