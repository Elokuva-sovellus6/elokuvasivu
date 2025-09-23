import { Link } from "react-router-dom";

function Movies({ movies, genreMap = {} }) {
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
              <Link to={`/movie/${movie.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card h-100 shadow-sm">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        className="card-img-top"
                        alt={movie.title}
                        style={{ height: "600px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                        style={{ height: "600px" }}
                      >
                        <span className="text-white">No image available</span>
                      </div>
                    )}
                  
                  
                  <div className="card-body">
                    <h5 className="card-title">
                        <strong>{movie.title}</strong>
                    </h5>
                  
                    {movie.release_date && (
                      <p className="card-text">
                        <strong>Release Year:</strong>{" "}
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    )}
  
                    <p className="card-text">
                      <strong>Genre:</strong>{" "}
                      {genreNames.length > 0 ? genreNames.join(", ") : "Ei määritelty"}
                    </p>
                  
                    {movie.overview && (
                      <p className="card-text">
                        <strong>Description: </strong>
                        {movie.overview.slice(0, 120)}...
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Movies;
