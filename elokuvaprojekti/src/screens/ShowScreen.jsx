import React, { useEffect, useState } from "react"
import "./style/ShowScreen.css"
import { Link } from "react-router-dom"
import GenericDropdown from "../components/Dropdown.jsx"
import { getTheatreAreas, getShows, formatDateForAPI } from "../api/finnkino.jsx"
import ShareShow from "../components/ShareShow.jsx"
import { matchFinnkinoWithTMDB } from '../api/moviedb.jsx'

export default function ShowScreen() {
  const [movieShows, setMovieShows] = useState([])
  const [uniqueMovies, setUniqueMovies] = useState([])
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState("1014")
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [tmdbIds, setTmdbIds] = useState({})
  const [selectedMovie, setSelectedMovie] = useState("all")

  function getTodayDate() {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Hakee teatterialueet
  useEffect(() => {
    (async () => {
      try {
        const areasFromAPI = await getTheatreAreas()
        setAreas(areasFromAPI)
      } catch (err) {
        console.error("Virhe haettaessa teatterialueita:", err)
      }
    })()
  }, [])

  // Hakee näytökset
  useEffect(() => {
    (async () => {
      try {
        const { movieShows, uniqueMovies } = await getShows(
          selectedArea,
          formatDateForAPI(selectedDate)
        )
        setMovieShows(movieShows)
        setUniqueMovies(uniqueMovies)
        setSelectedMovie("all") // resetoi valinnan kun alue/pvm vaihtuu
      } catch (err) {
        console.error("Virhe haettaessa näytöksiä:", err)
      }
    })()
  }, [selectedArea, selectedDate])

  // Hakee TMDB ID:t
  useEffect(() => {
  const getTmdbIds = async () => {
    const results = {}

    const matches = await matchFinnkinoWithTMDB(uniqueMovies)

    for (const m of matches) {
      results[m.finnkino.eventId] = m.tmdb.id
    }

    setTmdbIds(results)
  }

  if (uniqueMovies.length > 0) getTmdbIds()
}, [uniqueMovies])

  // Suodatettu lista valinnan mukaan
  const moviesToShow =
    selectedMovie === "all"
      ? uniqueMovies
      : uniqueMovies.filter((m) => m.eventId === selectedMovie)

  return (
    <div>
      <h3>Finnkino näytökset</h3>

      <div className="filters d-flex align-items-center gap-3 mb-3">
        <div className="filters">
          {/* Dropdown alueelle */}
          <GenericDropdown
            label="Valitse alue"
            items={areas}
            selected={selectedArea}
            onSelect={setSelectedArea}
            itemKey="id"
            itemLabel="name"
          />

          {/* Elokuvan valinta */}
          {uniqueMovies.length > 0 && (
            <GenericDropdown
              label="Valitse elokuva"
              items={[{ id: "all", name: "Kaikki elokuvat" }, ...uniqueMovies]}
              selected={selectedMovie}
              onSelect={setSelectedMovie}
              itemKey="eventId"
              itemLabel="name"
            />
          )}

          {/* Päivämäärän valinta */}
          <div className="date-picker">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {moviesToShow.map((movie) => {
            const tmdbId = tmdbIds[movie.eventId]

            const MovieImage = (
              <img
                src={movie.image}
                className="card-img-top movie-poster"
                alt={movie.name}
              />
            )

            const MovieTitle = (
              <h5 className="card-title">
                <strong>{movie.name}</strong>
              </h5>
            )

            return (
              <div key={movie.eventId} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  {/* Kuva linkkinä vain jos TMDB ID löytyy */}
                  {tmdbId ? (
                    <Link
                      to={`/movie/${tmdbId}`}
                      state={{
                        eventId: movie.eventId,
                        theatreAreaId: selectedArea,
                        showDate: selectedDate,
                      }}
                      className="movie-link"
                    >
                      {MovieImage}
                    </Link>
                  ) : (
                    MovieImage
                  )}

                  <div className="card-body">
                    {/* Nimi linkkinä vain jos TMDB ID löytyy */}
                    {tmdbId ? (
                      <Link
                        to={`/movie/${tmdbId}`}
                        state={{
                          eventId: movie.eventId,
                          theatreAreaId: selectedArea,
                          showDate: selectedDate,
                        }}
                        className="movie-link"
                      >
                        {MovieTitle}
                      </Link>
                    ) : (
                      MovieTitle
                    )}

                    <p className="card-text">
                      <strong>Genre:</strong> {movie.genre}
                    </p>
                    <p className="card-text">
                      <strong>Näytökset:</strong>
                    </p>
                    <div className="showtimes-list">
                      {movieShows
                        .filter((show) => show.name === movie.name)
                        .map((show, idx) => (
                          <ShareShow 
                            key={idx} 
                            show={show} 
                            tmdbId={tmdbIds[show.eventId]} 
                            movieName={movie.name}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}