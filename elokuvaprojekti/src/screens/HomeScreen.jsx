import { useEffect, useState, useMemo } from "react"
import { getPopularMovies, getMovieDetails, fetchGenres } from "../api/moviedb.jsx"
import { getLatestReviews } from "../api/review.jsx"
import ReviewCard from "../components/ReviewCard.jsx"
import axios from "axios"
import GroupCard from "../components/GroupCard.jsx"
import { Carousel } from "react-bootstrap"
import MovieCard from "../components/MovieCard.jsx"
import RatingStars from "../components/RatingStars.jsx"
import "./style/HomeScreen.css"

// Jakaa taulukon pienempiin osiin
function chunkArray(array, size) {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export default function HomeScreen() {
  const [reviewMovies, setReviewMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [newestGroups, setNewestGroups] = useState([])
  const [genres, setGenres] = useState([])

  // Lataa genret käynnistyksessä
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresData = await fetchGenres()
        setGenres(genresData)
      } catch (e) {
        console.error("Failed to fetch genres:", e)
      }
    }
    loadGenres()
  }, [])

  // Genre mapitus muistiin
  const genreMap = useMemo(
    () => Object.fromEntries((genres || []).map((g) => [g.id, g.name])),
    [genres]
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latest = await getLatestReviews()

        // hakee TMDB:stä elokuvan nimet
        const movies = await Promise.all(
          latest.map(async (r) => {
            try {
              const movie = await getMovieDetails(r.tmdbid)
              return { ...movie, ...r }
            } catch (e) {
              return { title: `Movie ID: ${r.tmdbid}`, ...r }
            }
          })
        )

        setReviewMovies(movies)
      } catch (err) {
        console.error("Failed to fetch latest reviews:", err)
      }
    }

    fetchData()
  }, [])

  // Suosituimmat elokuvat
  useEffect(() => {
    const fetchPopularWithReviews = async () => {
      try {
        const popular = await getPopularMovies(1)
        const moviesWithReviews = (popular.results || []).map((movie) => {
          return { ...movie } 
        })
        setPopularMovies(moviesWithReviews)
      } catch (err) {
        console.error("Failed to fetch popular movies:", err)
      }
    }
    fetchPopularWithReviews()
  }, [])

  // Uusimmat ryhmät
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/groups`
        )
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.createddate) - new Date(a.createdDate)
        )
        setNewestGroups(sorted.slice(0, 5))
      } catch (err) {
        console.error("Error fetching groups:", err)
      }
    }
    fetchGroups()
  }, [])

  // --- KARUSELLIEN JÄRJESTELY ---
  const movieChunks = chunkArray(popularMovies.slice(0, 12), 3)
  const reviewChunks = chunkArray(reviewMovies, 4) 
  const groupChunks = chunkArray(newestGroups, 4) 

  return (
    <div className="container mt-4">
      
      {/* 1. Suosituimmat elokuvat Karuselli (3 kpl) */}
      <h3>Suosituimmat elokuvat</h3>
      {popularMovies.length === 0 ? (
        <p>Ladataan...</p>
      ) : (
        <div className="carousel-wrapper"> 
          <Carousel interval={null} indicators={false}>
            {movieChunks.map((chunk, idx) => (
              <Carousel.Item key={idx}>
                {/* LISÄTTY: g-3 (gutter 3) luokka palauttaa välin */}
                <div className="row g-3"> 
                  {chunk.map((movie) => {
                    
                    const overview = movie.overview || "Ei kuvausta saatavilla."
                    const shortDescription = overview.slice(0, 120) + (overview.length > 120 ? "..." : "")

                    const genreNames = (movie.genre_ids || [])
                      .map((id) => genreMap[id])
                      .filter(Boolean)
                      .join(", ")

                    const customExtraContent = (
                        <div className="d-flex align-items-center">
                          <RatingStars rating={movie.vote_average / 2} />
                          <small className="ms-2">
                            {movie.vote_average ? `TMDB: ${movie.vote_average.toFixed(1)}/10` : ''}
                          </small>
                        </div>
                    )

                    return (
                      <MovieCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        imageSrc={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : null
                        }
                        linkTo={`/movie/${movie.id}`}
                        extraContent={customExtraContent}
                        description={shortDescription}
                        releaseYear={movie.release_date ? new Date(movie.release_date).getFullYear() : null}
                        genres={genreNames.length > 0 ? genreNames : "Ei määritelty"}
                      />
                    )
                  })}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}

      {/* 2. Arvostelut Karuselli (4 kpl) */}
      <h3 className="mt-5">Arvostelut</h3>
      {reviewMovies.length === 0 ? (
        <p>Ei vielä arvosteluja</p>
      ) : (
        <div className="carousel-wrapper">
          <Carousel interval={null} indicators={false}>
            {reviewChunks.map((chunk, idx) => (
              <Carousel.Item key={idx}>
                {/* LISÄTTY: g-3 luokka palauttaa välin */}
                <div className="row g-3">
                  {chunk.map((r) => (
                    <div className="col-md-3" key={r.reviewid}>
                      <ReviewCard
                        text={r.reviewtext}
                        username={r.username}
                        rating={r.rating}
                        date={new Date(r.reviewdate).toLocaleDateString("fi-FI")}
                        movieTitle={r.title}
                        movieId={r.tmdbid}
                      />
                    </div>
                  ))}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}

      {/* 3. Uusimmat ryhmät Karuselli (4 kpl) */}
      <h3 className="mt-5">Uusimmat ryhmät</h3>
      {newestGroups.length === 0 ? (
        <p>Ei ryhmiä</p>
      ) : (
        <div className="carousel-wrapper">
          <Carousel interval={null} indicators={false}>
            {groupChunks.map((chunk, idx) => (
              <Carousel.Item key={idx}>
                {/* LISÄTTY: g-3 luokka palauttaa välin */}
                <div className="row g-3">
                  {chunk.map(group => (
                    <div className="col-md-3" key={group.groupid}>
                      <GroupCard group={group} />
                    </div>
                  ))}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}
    </div>
  )
}