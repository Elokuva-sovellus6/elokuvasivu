function Movies({ movies }) {
  if (!movies || movies.length === 0) {
    return <p>Ei löytynyt tuloksia</p>
  }

  return (
    <div className="movies">
      {movies.map(movie => (
        <div key={movie.id} className="movie-card">
          <h4>{movie.title}</h4>
          {movie.poster_path ? (
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
          ) : (
            <p>No image available</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default Movies
