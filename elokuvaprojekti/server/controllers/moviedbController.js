import axios from "axios"
import { ApiError } from "../helper/ApiError.js"

const API_KEY = process.env.TMDB_API_KEY

// --- Apufunktiot --- //

// Hakee elokuvan englanninkieliset tiedot (otsikko, kuvaus), jos suomenkieliset puuttuvat.
const fetchWithFallback = async (id, originalMovie) => {
    // Jos suomenkielinen otsikko tai kuvaus puuttuu, haetaan englanninkieliset tiedot.
    if (!originalMovie.title || !originalMovie.overview) {
        const enResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${id}`,
            { params: { api_key: API_KEY, language: "en-US" } }
        )
        const enMovie = enResponse.data

        return {
            ...originalMovie, // Säilytetään kaikki olemassa oleva data
            title: originalMovie.title || enMovie.title, // Käytetään englanninkielistä, jos suomenkielinen puuttuu
            overview: originalMovie.overview || enMovie.overview, // Käytetään englanninkielistä, jos suomenkielinen puuttuu
        }
    }
    return originalMovie
}

// --- Kontrollerifunktiot (Reittien käsittelijät) --- //

// Hakee elokuvia TMDB:stä hakusanalla (search).
export const searchMovies = async (req, res, next) => {
    const { query, page = 1 } = req.query
    if (!query) return next(new ApiError("Missing query param", 400))

    try {
        const response = await axios.get("https://api.themoviedb.org/3/search/movie", {
            params: {
                api_key: API_KEY,
                language: "fi-FI",
                include_adult: false,
                page,
                query: query.trim(),
            },
        })

        let results = response.data.results || []

        // Käsittelee puuttuvat otsikot/kuvaukset englanninkielisellä datalla
        results = await Promise.all(results.map(movie => fetchWithFallback(movie.id, movie)))

        res.json({
            results,
            totalPages: Math.min(response.data.total_pages || 1, 500),
        })
    } catch (err) {
        console.error("TMDB search failed:", err.message)
        next(new ApiError("TMDB search failed", 500))
    }
}

// Hakee suosituimmat elokuvat TMDB:stä (popular).
export const getPopularMovies = async (req, res, next) => {
    const { page = 1 } = req.query
    try {
        const response = await axios.get("https://api.themoviedb.org/3/movie/popular", {
            params: {
                api_key: API_KEY,
                language: "fi-FI",
                page,
            },
        })

        let results = response.data.results || []

        // Käsittelee puuttuvat otsikot/kuvaukset englanninkielisellä datalla
        results = await Promise.all(results.map(movie => fetchWithFallback(movie.id, movie)))

        res.json({
            results,
            totalPages: Math.min(response.data.total_pages || 1, 500),
        })
    } catch (err) {
        next(new ApiError("TMDB popular failed", 500))
    }
}

// Hakee yksittäisen elokuvan tiedot ID:llä.
export const getMovieDetails = async (req, res, next) => {
    const { id } = req.params
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            params: { api_key: API_KEY, language: "fi-FI" },
        })
        
        // Hakee puuttuvat tiedot englanniksi fallback-funktiolla
        const movie = await fetchWithFallback(id, response.data)
        res.json(movie)
    } catch (err) {
        console.error("TMDB details failed:", err.message)
        next(new ApiError("TMDB details failed", 500))
    }
}

// Hakee elokuvia genren, vuoden tai vapaan hakusanan perusteella (discover/search).
export const discoverMovies = async (req, res, next) => {
    const { query = "", genre, year, page = 1 } = req.query

    let params = {
        api_key: API_KEY,
        language: "fi-FI",
        include_adult: false,
        page,
    }

    try {
        let url
        // Jos käyttäjä antoi hakusanan, käytetään search-rajapintaa
        if (query.trim().length > 0) {
            url = "https://api.themoviedb.org/3/search/movie"
            params.query = query.trim()
        } 
        // Muuten käytetään discover-rajapintaa (genre/year)
        else {
            url = "https://api.themoviedb.org/3/discover/movie"
            params.sort_by = "popularity.desc"
            if (genre) params.with_genres = genre
            if (year) params.primary_release_year = year
        }

        const response = await axios.get(url, { params })
        let results = response.data.results || []

        // Käsittelee puuttuvat otsikot/kuvaukset englanninkielisellä datalla
        results = await Promise.all(results.map(movie => fetchWithFallback(movie.id, movie)))

        res.json({
            results,
            totalPages: Math.min(response.data.total_pages || 1, 500),
        })
    } catch (err) {
        console.error("TMDB discover/search failed:", err.message)
        next(new ApiError("TMDB discover/search failed", 500))
    }
}

// Hakee TMDB:stä listan elokuvagenreistä.
export const getGenres = async (req, res, next) => {
    try {
        const response = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
            params: { api_key: API_KEY, language: "fi-FI" },
        })
        res.json({ genres: response.data.genres || [] })
    } catch (err) {
        console.error("TMDB genres failed:", err.message)
        next(new ApiError("TMDB genres fetch failed", 500))
    }
}

// Yleiskäyttöinen elokuvahaku, käytännössä sama kuin searchMovies.
export const fetchTMDBMovies = async (req, res, next) => {
    const { query, page = 1 } = req.query
    if (!query) return next(new ApiError(400, "Missing query param"))

    try {
        const response = await axios.get("https://api.themoviedb.org/3/search/movie", {
            params: {
                api_key: API_KEY,
                query,
                language: "fi-FI",
                include_adult: false,
                page,
            },
        })

        let results = response.data.results || []
        // Käsittelee puuttuvat otsikot/kuvaukset englanninkielisellä datalla
        results = await Promise.all(results.map(movie => fetchWithFallback(movie.id, movie)))

        res.json({
            results,
            totalPages: Math.min(response.data.total_pages || 0, 500),
        })
    } catch (err) {
        next(new ApiError("TMDB fetch failed", 500))
    }
}