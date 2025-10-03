import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import GenericDropdown from "../components/Dropdown.js"
import { getTheatreAreas, getShows, formatDateForAPI } from "../api/finnkino.js"
import { matchFinnkinoWithTMDB } from '../api/moviedb.js'

export default function ShowScreen() {
  const [movieShows, setMovieShows] = useState([])
  const [uniqueMovies, setUniqueMovies] = useState([])
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState("1014")
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [tmdbIds, setTmdbIds] = useState({})

  function getTodayDate() {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  useEffect(() => {
    (async () => {
      try {
        const areasFromAPI = await getTheatreAreas()
        setAreas(areasFromAPI)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const { movieShows, uniqueMovies } = await getShows(
          selectedArea,
          formatDateForAPI(selectedDate)
        )
        setMovieShows(movieShows)
        setUniqueMovies(uniqueMovies)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [selectedArea, selectedDate])

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

  return (
    <div>
      <h3>Finnkino näytökset</h3>
      <GenericDropdown
        label="Valitse alue"
        items={areas}
        selected={selectedArea}
        onSelect={setSelectedArea}
        itemKey="id"
        itemLabel="name"
      />
      <label style={{ marginLeft: '1rem' }}>Valitse päivämäärä: </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <div className="container mt-4">
        <div className="row">
          {uniqueMovies.map((movie) => {
            const tmdbId = tmdbIds[movie.eventId]

            const CardContent = (
              <>
                <img
                  src={movie.image}
                  className="card-img-top"
                  alt={movie.name}
                  style={{ height: "600px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title"><strong>{movie.name}</strong></h5>
                  <p className="card-text">
                    <strong>Genre:</strong> {movie.genre}
                  </p>
                  <p className="card-text"><strong>Näytökset:</strong></p>
                  <ul className="mb-0">
                    {movieShows
                      .filter(show => show.name === movie.name)
                      .map((show, idx) => (
                        <li key={idx}>
                          {new Date(show.time).toLocaleTimeString('fi-FI', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} ({show.theatre})
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            )

            return (
              <div key={movie.eventId} className="col-md-6 col-lg-4 mb-4">
                {tmdbId ? (
                  <Link
                    to={`/movie/${tmdbId}`}
                    state={{
                      eventId: movie.eventId,
                      theatreAreaId: selectedArea,
                      showDate: selectedDate
                    }}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="card h-100 shadow-sm">{CardContent}</div>
                  </Link>
                ) : (
                  <div className="card h-100 shadow-sm">{CardContent}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}