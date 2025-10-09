import React, { useEffect, useState } from "react";
import "./style/ShowScreen.css";
import GenericDropdown from "../components/Dropdown.jsx";
import { getTheatreAreas, getShows, formatDateForAPI } from "../api/finnkino.jsx";
import ShareShow from "../components/ShareShow.jsx";
import { matchFinnkinoWithTMDB } from '../api/moviedb.jsx';
import MovieCard from "../components/MovieCard.jsx";

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
        const { movieShows: shows, uniqueMovies: movies } = await getShows(
          selectedArea,
          formatDateForAPI(selectedDate)
        )
        setMovieShows(shows)
        setUniqueMovies(movies)
        setSelectedMovie("all") // resetoi valinnan kun alue/pvm vaihtuu
      } catch (err) {
        console.error("Virhe haettaessa näytöksiä:", err)
      }
    })()
  }, [selectedArea, selectedDate])

  // Hakee tmdbId:t
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

      <div className="filters flex-wrap">
        <div className="filter-item area-dropdown">
          <GenericDropdown
            label="Valitse alue"
            items={areas}
            selected={selectedArea}
            onSelect={setSelectedArea}
            itemKey="id"
            itemLabel="name"
          />
        </div>

        {uniqueMovies.length > 0 && (
          <div className="filter-item movie-dropdown">
            <GenericDropdown
              label="Valitse elokuva"
              items={[{ id: "all", name: "Kaikki elokuvat" }, ...uniqueMovies]}
              selected={selectedMovie}
              onSelect={setSelectedMovie}
              itemKey="eventId"
              itemLabel="name"
            />
          </div>
        )}

        <div className="filter-item date-dropdown">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {moviesToShow.map((movie) => {
            const tmdbId = tmdbIds[movie.eventId]
            const linkTarget = tmdbId ? `/movie/${tmdbId}` : null

            // Sisältö näytöksille
            const showtimesContent = (
              <>
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
              </>
            )

            return (
              <MovieCard
                key={movie.eventId}
                id={movie.eventId}
                title={movie.name}
                imageSrc={movie.image} // Finnkino antaa koko kuvan URL:n
                linkTo={linkTarget}
                genres={movie.genre} // Finnkinon data antaa genren stringinä
                extraContent={showtimesContent}
                isLink={!!tmdbId} // Linkki on aktiivinen vain, jos tmdbId löytyy
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}