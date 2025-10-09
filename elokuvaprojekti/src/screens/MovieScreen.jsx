// MovieScreen.js (Muutettu arvosanan näyttötapaa)

import { useState, useEffect, useMemo } from "react"
import MovieCard from "../components/MovieCard.jsx"
import { getPopularMovies, searchMovies, discoverMovies, fetchGenres } from "../api/moviedb.jsx"
import Pagination from "../components/Pagination.jsx"
import GenericDropdown from "../components/Dropdown.jsx"
import RatingStars from "../components/RatingStars.jsx"
import "./style/MovieScreen.css"

export default function MovieScreen() {
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query, setQuery] = useState("")

  // Lataa genret
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

  // Haetaan elokuvat kun query, genre, päivämäärä tai sivu muuttuu
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      setError("")

      try {
        let data

        if (query.trim().length > 0) {
          // Hakusana käytössä
          data = await searchMovies(query, currentPage)

          let filtered = data.results || []

          if (selectedGenre) {
            const genreIdNumber = Number(selectedGenre)
            filtered = filtered.filter((m) => m.genre_ids.includes(genreIdNumber))
          }

          if (selectedDate) {
            filtered = filtered.filter(
              (m) =>
                m.release_date &&
                m.release_date.startsWith(String(selectedDate))
            )
          }

          data.results = filtered
          // totalPages ei muutu client-side filtteröinnissä, käytetään TMDB:n antamaa arvoa
        } else if (!selectedGenre && !selectedDate) {
          // Ei filttereitä eikä hakusanaa -> suositut
          data = await getPopularMovies(currentPage)
        } else {
          // Filtterit käytössä ilman hakusanaa → discover backendistä
          data = await discoverMovies({
            genre: selectedGenre || undefined,
            year: selectedDate ? Number(selectedDate) : undefined,
            page: currentPage,
          })
        }

        setMovies(data.results || [])
        setTotalPages(data.totalPages || data.total_pages || 1)
      } catch (err) {
        console.error(err)
        setError("Virhe haettaessa elokuvia")
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [query, selectedGenre, selectedDate, currentPage])

  // Nollaa sivun kun suodattimet tai hakusana muuttuu
  useEffect(() => {
    setCurrentPage(1)
  }, [query, selectedGenre, selectedDate])

  const handleYearChange = (e) => {
    const val = e.target.value
    setSelectedDate(val === "" ? "" : Number(val))
  }

  return (
    <div className="container">
      <h3>Hae elokuvia TMDB:stä</h3>
{/* Filtterit */}
<div className="filters">
  <div className="filter-item">
    <GenericDropdown
      label="Valitse genre"
      items={genres}
      selected={selectedGenre}
      onSelect={setSelectedGenre}
      itemKey="id"
      itemLabel="name"
    />
  </div>

  <div className="filter-item">
    <input
      type="number"
      min="1900"
      max={new Date().getFullYear()}
      value={selectedDate}
      onChange={handleYearChange}
      placeholder="Julkaisuvuosi"
      className="form-control"
    />
  </div>

  <div className="filter-item">
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        type="search"
        className="form-control"
        placeholder="Etsi elokuvia"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  </div>
</div>

      <div style={{ marginTop: "2rem" }}>
        {loading && <p>Ladataan...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="container mt-4">
          <div className="row">
            {movies.length === 0 && !loading ? (
                <p>Ei löytynyt tuloksia</p>
            ) : (
                movies.map((movie) => {
                const genreNames = (movie.genre_ids || [])
                    .map((id) => genreMap[id])
                    .filter(Boolean)
                    .join(", ")

                const descriptionText = movie.overview 
                    ? movie.overview.slice(0, 120) + "..."
                    : "Ei kuvausta"
                
                const customExtraContent = (
                    <div className="d-flex align-items-center card-text">
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
                    description={descriptionText}
                    linkTo={`/movie/${movie.id}`}
                    releaseYear={
                        movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : null
                    }
                    genres={genreNames.length > 0 ? genreNames : "Ei määritelty"}
                    extraContent={customExtraContent} 
                    />
                )
                })
            )}
          </div>
        </div>

        {movies.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}