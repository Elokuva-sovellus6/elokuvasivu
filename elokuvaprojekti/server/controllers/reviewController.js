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