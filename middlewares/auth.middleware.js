import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncHandler from "./asyncHandler.middleware.js";
const SECRET_KEY=process.env.JWT_SECRET;
export const isLoggedIn = asyncHandler(async (req, _res, next) => {
    console.log("Cookies received:", req.cookies); // Log cookies to debug
  // Extracting token from cookies
 // const  token  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdFVzZXIiLCJpYXQiOjE3NDAxMTg2NTAsImV4cCI6MTc0MDEyMjI1MH0.Yy6533GgTCRXR88yZ9ldLHQBOasyNpedHr0Zv9MnLUU";
//const  token  = req.headers?.authorization;
   
    const token=req.cookies?.token;
  if (!token) {
    return next(new AppError("Unauthorized, please login to continue", 401));
  }

  try {
    // Decoding the token using JWT verify method
   //const decoded =process.env.JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded); // Debugging

    req.user = decoded; // Store user data in req object
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return next(new AppError("Invalid or expired token, please login again", 401));
  }
});
/**
* @param  {...string} roles 
 */
// Middleware to check if user is admin or not
export const authorizeRoles = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user||!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to view this route", 403)
        
      );
    }
    next();
  });

// Middleware to check if user has an active subscription or not
export const authorizeSubscribers = asyncHandler(async (req, _res, next) => {
  // If user is not admin or does not have an active subscription, restrict access
  if (req.user.role !== "ADMIN" && req.user.subscription?.status !== "active") {
    return next(new AppError("Please subscribe to access this route.", 403));
  }
  next();
});

