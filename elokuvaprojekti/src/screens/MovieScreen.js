import { useState, useEffect, useMemo  } from "react"
import MovieCard from "../components/MovieCard"
import { getMovieDetails, getPopularMovies  } from "../api/moviedb";
import Pagination from "../components/Pagination";
import GenericDropdown from "../components/Dropdown";

export default function MovieScreen() {
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 12

  const API_KEY = process.env.REACT_APP_TMDB_API_KEY

  // Haetaan TMDB genret dropdownia varten
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
        )
        const data = await res.json()
        setGenres(data.genres)
      } catch (err) {
        console.error(err)
      }
    }
    fetchGenres()
  }, [API_KEY])

  const genreMap = useMemo(
    () => Object.fromEntries((genres || []).map((g) => [g.id, g.name])),
    [genres]
  )

  // Haetaan elokuvat kun genre, päivämäärä tai sivu muuttuu
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      setError("")

      try {
        let data

        if (!selectedGenre && !selectedDate) {
          // Ei filttereitä → näytetään suositut
          data = await getPopularMovies(currentPage)
        } else {
          // Käytetään discover-hakua
          let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=fi&sort_by=popularity.desc&page=${currentPage}`

          if (selectedGenre) url += `&with_genres=${selectedGenre}`
          if (selectedDate) url += `&primary_release_year=${selectedDate}`

          const res = await fetch(url)
          data = await res.json()
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
  }, [selectedGenre, selectedDate, currentPage, API_KEY])

  // Jos vaihdetaan genre tai päivä → aloitetaan aina sivulta 1
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGenre, selectedDate])

  return (
    <div className="container">
      <h3>Hae elokuvia TMDB:stä</h3>

      {/* Genren valinta */}
      <GenericDropdown
        label="Valitse genre"
        items={genres}             
        selected={selectedGenre}
        onSelect={setSelectedGenre}
        itemKey="id"
        itemLabel="name"
      />

      {/* Päivämäärän valinta */}
      <input
        type="number"
        min="1900"
        max={new Date().getFullYear()}
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        placeholder="Esim. 2020"
      />

      {/* Tulokset */}
      <div style={{ marginTop: "2rem" }}>
        {loading && <p>Ladataan...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <MovieCard movies={movies} genreMap={genreMap} />

        {/* Pagination */}
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
