import { useParams } from "react-router-dom";
import { useEffect, useState, useContext  } from "react";
import { getMovieDetails } from "../api/moviedb";
import ReviewCard from "../components/ReviewCard";
import Rating from "../components/Rating";
import { AuthContext } from '../context/authContext.js';

export default function MovieScreen() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const { isLoggedIn, token } = useContext(AuthContext)

  useEffect(() => {
    getMovieDetails(id).then(setMovie)
  }, [id])

  if (!movie) return <p>Ladataan...</p>

const arvostelut = [
    { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
    { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
    { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
    { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
    { text: "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non provident, sunt in culpa qui official deserunt mollit anim id est laborum." },
  ]

  return (
    <div className="container py-4">
      {/* MOVIE SECTION */}
      <section className="movie-section row mb-5">
        {/* Vasemmalle kuva ja painikkeet */}
        <div className="col-md-4 text-center">
          <div className="img bg-secondary mb-3 d-flex justify-content-center align-items-center" style={{ height: "600px", overflow: "hidden"  }}>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div className="buttons d-flex gap-2">
            <button className="btn btn-primary">Share</button>
            <button className="btn btn-outline-danger">Add to Favorites</button>
          </div>
        </div>
        {/* Oikealle kuvausteksti */}
        <div className="col-md-6">
          <h2>{movie.title}</h2>
          <p>{movie.overview}</p>
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
