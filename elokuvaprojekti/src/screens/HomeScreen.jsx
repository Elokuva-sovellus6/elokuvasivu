import { useEffect, useState, useMemo } from "react"
import { getPopularMovies, getMovieDetails, fetchGenres } from "../api/moviedb.jsx"
import { getLatestReviews } from "../api/review.jsx"
import ReviewCard from "../components/ReviewCard.jsx"
import MovieCard from "../components/MovieCard.jsx"
import GroupCard from "../components/GroupCard.jsx"
import RatingStars from "../components/RatingStars.jsx"
import Carousel from "../components/Carousel.jsx"
import axios from "axios"
import "./style/HomeScreen.css"

export default function HomeScreen() {
  const [reviewMovies, setReviewMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [newestGroups, setNewestGroups] = useState([])
  const [genres, setGenres] = useState([])

  useEffect(() => {
    const loadGenres = async () => {
      const genresData = await fetchGenres()
      setGenres(genresData)
    }
    loadGenres()
  }, [])

  const genreMap = useMemo(
    () => Object.fromEntries((genres || []).map((g) => [g.id, g.name])),
    [genres]
  )

  useEffect(() => {
    const fetchData = async () => {
      const latest = await getLatestReviews()
      const movies = await Promise.all(
        latest.map(async (r) => {
          try {
            const movie = await getMovieDetails(r.tmdbid)
            return { ...movie, ...r }
          } catch {
            return { title: `Movie ID: ${r.tmdbid}`, ...r }
          }
        })
      )
      setReviewMovies(movies)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchPopular = async () => {
      const popular = await getPopularMovies(1)
      setPopularMovies(popular.results || [])
    }
    fetchPopular()
  }, [])

  useEffect(() => {
    const fetchNewestGroups = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`)
        const sorted = [...response.data]
          .sort((a, b) => new Date(b.createddate) - new Date(a.createddate))
          .slice(0, 12)
        setNewestGroups(sorted)
      } catch (err) {
        console.error("Error fetching newest groups:", err)
      }
    }
    fetchNewestGroups()
  }, [])

  return (
    <div className="container mt-4">
      {/* Suosituimmat elokuvat */}
      <h3>Suosituimmat elokuvat</h3>
      <div className="horizontal-list-wrapper movie-carousel">
        <Carousel>
          {popularMovies.slice(0, 12).map((movie) => (
            <div 
              key={movie.id} 
              className="horizontal-scroll-item"
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                imageSrc={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null}
                linkTo={`/movie/${movie.id}`}
                extraContent={
                  <div className="d-flex align-items-center">
                    <RatingStars rating={movie.vote_average / 2} />
                    <small className="card-text">{movie.vote_average ? `TMDB: ${movie.vote_average.toFixed(1)}/10` : ""}</small>
                  </div>
                }
                description={movie.overview?.slice(0, 120) + (movie.overview?.length > 120 ? "..." : "")}
                releaseYear={movie.release_date ? new Date(movie.release_date).getFullYear() : null}
                genres={(movie.genre_ids || []).map((id) => genreMap[id]).filter(Boolean).join(", ") || "Ei määritelty"}
                noColWrapper
              />
            </div>
          ))}
        </Carousel>
      </div>

      {/* Arvostelut */}
      <h3 className="mt-5">Arvostelut</h3>
      <div className="horizontal-list-wrapper review-carousel">
        <Carousel>
          {reviewMovies.slice(0, 12).map((r) => (
            <div 
              key={r.reviewid || r.tmdbid}
              className="horizontal-scroll-item"
            >
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
        </Carousel>
      </div>

      {/* Uusimmat ryhmät */}
      <h3 className="mt-5">Uusimmat ryhmät</h3>
      <div className="horizontal-list-wrapper group-carousel">
        <Carousel>
          {newestGroups.slice(0, 12).map((group) => (
            <div 
              key={group.groupid} 
              className="horizontal-scroll-item"
            >
              <GroupCard group={group} />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  )
}