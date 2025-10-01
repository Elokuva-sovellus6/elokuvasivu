import { useState, useEffect, useMemo } from "react"
import MovieCard from "../components/MovieCard"
import { getPopularMovies, searchMovies } from "../api/moviedb"
import Pagination from "../components/Pagination"
import GenericDropdown from "../components/Dropdown"

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

  const itemsPerPage = 12
  const API_KEY = process.env.REACT_APP_TMDB_API_KEY

  // Haetaan TMDB genret dropdownia varten
  useEffect(() => {
    const fetchGenres = async () => {

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=fi-FI`
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

// Haetaan elokuvat kun query, genre, päivämäärä tai sivu muuttuu
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      setError("")

    try {
      let data 
        if (query.trim().length > 0) { 
          // Hakusana käytössä → haetaan hakutulokset 
          data = await searchMovies(query, currentPage) 
          
          // Suodatetaan tulokset genren ja vuoden mukaan client-puolella 
          let filtered = data.results || [] 
          
          if (selectedGenre) { 
            filtered = filtered.filter((m) => 
              m.genre_ids.includes(Number(selectedGenre)) 
            ) 

          } 
          if (selectedDate) { filtered = filtered.filter( 
              (m) => 
                m.release_date && 
                m.release_date.startsWith(selectedDate.toString()) 
            ) 
          }

          data.results = filtered

      } else if (!selectedGenre && !selectedDate) {
        // Ei ole filttereitä käytössä, näytetään suositut
        data = await getPopularMovies(currentPage)
      } else {
        // Käytetään discover hakua
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
  }, [query, selectedGenre, selectedDate, currentPage, API_KEY])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, selectedGenre, selectedDate])

  return ( 
  <div className="container"> 
    <h3>Hae elokuvia TMDB:stä</h3> 
    <div className="row g-2 mb-3 align-items-center">
      <div className="col-2">
        {/* Genren valinta */} <GenericDropdown
          label="Valitse genre"
          items={genres}
          selected={selectedGenre}
          onSelect={setSelectedGenre}
          itemKey="id"
          itemLabel="name"
        />
      </div>
      <div className="col-3">
        {/* Vuoden valinta */}
        <input
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="Julkaisuvuosi"
        />
      </div>
    </div>
    <div className="col-5">
      {/* Hakupalkki */}
      <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
        <input
        className="form-control me-2"
        type="search"
        placeholder="Etsi elokuvia"
        aria-label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        /> 
      </form> 
    </div>
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
