import { useParams } from "react-router-dom";
import { useEffect, useState, useContext, useMemo  } from "react";
import { getMovieDetails } from "../api/moviedb";
import ReviewCard from "../components/ReviewCard";
import Rating from "../components/Rating";
import { AuthContext } from '../context/authContext.js';
import "./MoviePage.css"

export default function MoviePge() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [genres, setGenres] = useState([])
  const { isLoggedIn, token } = useContext(AuthContext)

  const API_KEY = process.env.REACT_APP_TMDB_API_KEY

  useEffect(() => {
    getMovieDetails(id).then(setMovie)
    }, [id])

    useEffect(() => {
      const fetchGenres = async () => {
        try {
          const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`)
          const data = await res.json()
          setGenres(data.genres)
        } catch (err) {
          console.error(err)
        }
      }
      fetchGenres()
    }, [API_KEY])

    const genreMap = useMemo(
      () => Object.fromEntries((genres || []).map(g => [g.id, g.name])),
      [genres]
    )

    if (!movie) return <p>Ladataan...</p>

    const genreNames = movie.genres?.map(g => g.name) || []

    const arvostelut = [
        { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
        { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
        { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
        { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
        { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
    ]

return (
    <div className="container py-4">
      <section className="movie-section row mb-5">
        <div className="col-md-4 text-center">
          <div className="img bg-secondary mb-3 d-flex justify-content-center align-items-center">
            <img
              className="card-img-top movie-img"
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
          </div>
          <div className="buttons d-flex gap-2">
            <button className="btn btn-primary">Share</button>
            <button className="btn btn-outline-danger">Add to Favorites</button>
          </div>
        </div>

        <div className="col-md-6">
          <h2>{movie.title}</h2>
          {movie.release_date && (
            <p className="card-text">
              <strong>Release Year:</strong> {new Date(movie.release_date).getFullYear()}
            </p>
          )}
          <p className="card-text">
            <strong>Genre:</strong> {genreNames.length > 0 ? genreNames.join(", ") : "Ei määritelty"}
          </p>
          <p><strong>Description:</strong> {movie.overview}</p>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="reviews-section mb-5">
        <h3 className="mb-3">Top Reviews</h3>
        <div className="reviews-scroll d-flex overflow-auto">
          {arvostelut.map((a, i) => (
            <ReviewCard key={i} text={a.text} />
          ))}
        </div>
      </section>

      {/* RATING SECTION */}
      <section className="rating-section row mb-5">
        {/* Vasen puoli: tähdet, textarea, submit */}
        <div className="col-md-6">
            <Rating movieId={id} token={token} />
        </div>
        {/* Oikea puoli: aikataulu */}
        <div className="col-md-6">
          <div className="schedule p-5 border rounded">
            <h4>Showtimes</h4>
            <p>Tähän tuodaan aikataulut myöhemmin.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer text-center py-3 border-top">
        <small>© 2025 Elokuvasivu</small>
      </footer>
    </div>
  )
}
