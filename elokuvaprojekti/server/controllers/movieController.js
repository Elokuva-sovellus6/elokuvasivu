import { ApiError } from "../helper/ApiError.js"
import Review from "../models/Review.js"

// Uuden arvostelun lisääminen
export const createReview = async (req, res, next) => {
    try {
        const { movieId } = req.params
        const { rating, review } = req.body
        const userId = req.user.id

        if (!rating || rating < 0 || rating > 5) {
            throw new ApiError("Arvosanan tulee olla 0 ja 5 välillä", 400)
        }

        await Review.create(movieId, userId, rating, review)

        res.status(201).json({ message: "Arvostelu luotu onnistuneesti" })
    } catch (err) {
        next(err)
    }
}

// Hakee arvostelut elokuvan TMDB ID:n perusteella
export const getReviews = async (req, res, next) => {
    try {
        const { movieId } = req.params

        const reviews = await Review.findByTmdbId(movieId)

        res.json(reviews)
    } catch (err) {
        next(err)
    }
}

// Hakee käyttäjän arvostelut
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params
    const reviews = await Review.findByUserId(userId)
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

// Hakee uusimmat arvostelut
export const getLatestReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findLatest(10)
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

// Poistaa arvostelun
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params
    const deleted = await Review.delete(reviewId)
    
    // Tarkistetaan löytyykö arvostelua
    if (!deleted) {
        throw new ApiError('Arvostelua ei löytynyt', 404)
    }
    
    res.json({ message: 'Arvostelu poistettu onnistuneesti' })
  } catch (err) {
    next(err)
  }
}