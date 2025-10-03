import express from "express";
import { searchMovies, getPopularMovies, getMovieDetails, fetchTMDBMovies, discoverMovies, getGenres } from "../controllers/moviedbController.js";

const router = express.Router()

// Reitti elokuvahauille TMDB:stä
router.get("/search", searchMovies)

// Reitti suosituille elokuvielle TMDB:stä
router.get("/popular", getPopularMovies)

// Yleinen reitti elokuvatietojen hakuun/listaukseen (käytetään usein Finnkino-matchissä)
router.get("/tmdbdata", fetchTMDBMovies)

// Reitti elokuvien selaamiseen (discover), esim. genren tai vuoden perusteella
router.get("/discover", discoverMovies)

// Reitti TMDB:n genre-listan hakemiseen
router.get("/genres", getGenres)

// Reitti haulle ID:n perusteella TMDB:stä
router.get("/:id", getMovieDetails)

export default router