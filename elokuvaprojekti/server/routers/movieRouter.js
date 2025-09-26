import express from "express";
import { createReview, getReviews, getUserReviews, deleteReview, getLatestReviews } from "../controllers/movieController.js";
import { authenticateToken } from "../helper/auth.js";

const router = express.Router();

// Hae käyttäjän arvostelut elokuvalle
router.get("/user/:userId/reviews", getUserReviews)

// Lisää arvostelu elokuvalle
router.post("/:movieId/review", authenticateToken, createReview)

// Hae kaikki arvostelut elokuvalle
router.get("/:movieId/review", getReviews)

// Hae 10 viimeisintä arvostelua
router.get("/reviews/latest", getLatestReviews)

// Arvostelun poisto
router.delete('/review/:reviewId', authenticateToken, deleteReview)

export default router
