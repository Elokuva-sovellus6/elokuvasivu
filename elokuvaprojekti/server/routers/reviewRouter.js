import express from "express";
import { createReview, getReviews } from "../controllers/reviewController.js";
import { authenticateToken } from "../helper/auth.js";

const router = express.Router();

// Lisää arvostelu elokuvalle
router.post("/:movieId/review", authenticateToken, createReview)

// Hae kaikki arvostelut elokuvalle
router.get("/:movieId/review", getReviews)

export default router
