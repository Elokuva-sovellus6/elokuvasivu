import { ApiError } from "../helper/ApiError.js";
import Review from "../models/Review.js";

// Uuden arvostelun lisääminen
export const createReview = async (req, res, next) => {
    try {
        const { movieId } = req.params
        const { rating, review } = req.body
        const userId = req.user.id

        if (!rating || rating < 0 || rating > 5) {
            throw new ApiError("Arvosanan pitää olla 0 ja 5 väliltä", 400)
        }

        await Review.create(movieId, userId, rating, review);

        res.status(201).json({ message: "Arvostelu luotu onnistuneesti" })
    } catch (err) {
        next(err)
    }
}

export const getReviews = async (req, res, next) => {
    try {
        const { movieId } = req.params

        if (!movieId) {
            throw new ApiError('Elokuvan ID puuttuu', 400)
        }

        const reviews = await Review.findByTmdbId(movieId)

        res.json(reviews)
    } catch (err) {
        next(err)
    }
}