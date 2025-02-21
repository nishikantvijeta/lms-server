import AppError from "../utils/appError.js";
import asyncHandler from "./asyncHandler.middleware.js";

// Middleware to check if user is logged in (Session-Based)
export const isLoggedIn = asyncHandler(async (req, _res, next) => {
    console.log("Session Data:", req.session); // Debugging

    // Check if user session exists
    if (!req.session.user) {
        return next(new AppError("Unauthorized, please login to continue", 401));
    }

    req.user = req.session.user;  // Store user data in req object
    next();
});

/**
 * Middleware to check user roles
 * @param  {...string} roles 
 */
export const authorizeRoles = (...roles) =>
    asyncHandler(async (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to view this route", 403));
        }
        next();
    });

// Middleware to check if user has an active subscription
export const authorizeSubscribers = asyncHandler(async (req, _res, next) => {
    if (req.user.role !== "ADMIN" && req.user.subscription?.status !== "active") {
        return next(new AppError("Please subscribe to access this route.", 403));
    }
    next();
});


