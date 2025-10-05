import { Link } from "react-router-dom";
import "./style/MovieCard.css"

export  default function MovieCard({ movies, genreMap = {} }) {
  if (!movies || movies.length === 0) {
    return <p>Ei löytynyt tuloksia</p>
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {movies.map((movie) => {
          const genreNames = (movie.genre_ids || [])
            .map((id) => genreMap[id])
            .filter(Boolean)

          return (
            <div className="col-md-6 col-lg-4 mb-4" key={movie.id}>
              <Link to={`/movie/${movie.id}`} className="card movie-link h-100 shadow-sm text-dark text-decoration-none">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    className="card-img-top movie-card-img"
                    alt={movie.title}
                  />
                ) : (
                  <div
                    className="card-img-top movie-card-no-img bg-secondary d-flex align-items-center justify-content-center"
                  >
                    <span className="text-white">Ei kuvaa saatavilla</span>
                  </div>
                )}
                 
                 
                <div className="card-body">
                  <h5 className="card-title">
                      <strong>{movie.title}</strong>
                  </h5>
                 
                  {movie.release_date && (
                    <p className="card-text">
                      <strong>Julkaisuvuosi:</strong>{" "}
                      {new Date(movie.release_date).getFullYear()}
                    </p>
                  )}
  
                  <p className="card-text">
                    <strong>Genre:</strong>{" "}
                    {genreNames.length > 0 ? genreNames.join(", ") : "Ei määritelty"}
                  </p>
                 
                  {movie.overview && (
                    <p className="card-text">
                      <strong>Kuvaus: </strong>
                      {movie.overview.slice(0, 120)}...
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
