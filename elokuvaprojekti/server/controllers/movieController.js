import { ApiError } from "../helper/ApiError.js";
import Review from "../models/Review.js";

// Uuden arvostelun lisääminen
export const createReview = async (req, res, next) => {
    try {
        const { movieId } = req.params
        const { rating, review } = req.body
        const userId = req.user.id

        if (!rating || rating < 0 || rating > 5) {
            throw new ApiError("Rating must be between 0 and 5", 400)
        }

        await Review.create(movieId, userId, rating, review);

        res.status(201).json({ message: "Review created successfully" })
    } catch (err) {
        next(err)
    }
}

export const getReviews = async (req, res, next) => {
    try {
        const { movieId } = req.params;

        const reviews = await Review.findByTmdbId(movieId)

        res.json(reviews)
    } catch (err) {
        next(err)
    }
}

export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.findByUserId(userId)
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

export const getLatestReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findLatest(10); // esim. 10 uusinta
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params
    const deleted = await Review.delete(reviewId)
    if (!deleted) throw new ApiError('Review not found', 404)
    res.json({ message: 'Review deleted successfully' })
  } catch (err) {
    next(err)
  }
}