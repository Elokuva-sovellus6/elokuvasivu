import { useEffect, useState } from "react"
import { getTheatreAreas, getShows, formatDateForAPI } from "../api/finnkino.jsx"
import GenericDropdown from "./Dropdown.jsx"
import ShareShow from "./ShareShow.jsx"
import "./style/ShowTimes.css"

export default function ShowTimes({ eventId, tmdbId, defaultArea, defaultDate }) {
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(defaultArea || "1014")
  const [selectedDate, setSelectedDate] = useState(defaultDate || getTodayDate())
  const [shows, setShows] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Hakee tämän päivän päivämäärän YYYY-MM-DD muodossa
  function getTodayDate() {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Hakee teatterialueet kerran
  useEffect(() => {
    (async () => {
      try {
        const areasFromAPI = await getTheatreAreas()
        setAreas(areasFromAPI)
      } catch (err) {
        console.error("Virhe teatterialueita haettaessa:", err)
      }
    })()
  }, [])

  // Hakee ja suodattaa näytökset, kun valinnat muuttuu
  useEffect(() => {
    if (!eventId) {
      setShows([])
      return
    }

    const fetchShows = async () => {
      setIsLoading(true)
      setShows([])

      try {
        // Muotoilee valitun päivämäärän Finnkino API:n vaatimaan muotoon
        const dateForAPI = formatDateForAPI(selectedDate) 
        
        // Hakee kaikki näytökset valitulta alueelta ja päivältä
        const { movieShows } = await getShows(selectedArea, dateForAPI)
        
        // Suodatetaan haetuista näytöksistä vaan tämä elokuva
        const filteredShows = movieShows.filter(show => String(show.eventId) === String(eventId))
        setShows(filteredShows)
      } catch (err) {
        console.error("Virhe näytöksiä haettaessa:", err)
        setShows([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchShows()
    // Suoritetaan aina kun alue, päivä tai eventId vaihtuu
  }, [selectedArea, selectedDate, eventId]) 

  return (
    <div className="showtimes-card">
      <div className="showtimes-filters mb-3">
        {/* Teatterivalinnan pudotusvalikko */}
        <GenericDropdown
          label="Valitse teatteri"
          items={areas}
          selected={selectedArea}
          onSelect={setSelectedArea}
          itemKey="id"
          itemLabel="name"
        />

        {/* Päivämäärän valintakenttä */}
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Latauksen ja tyhjän tilan ilmoitukset */}
      {isLoading && <p>Ladataan näytöksiä...</p>}
      {!isLoading && shows.length === 0 && <p>Ei näytöksiä valitulle päivälle.</p>}

      <div className={shows.length > 3 ? "showtimes-scroll" : ""}>
        <ul className="list-group">
          {shows.map((s, idx) => (
            // Komponentti, joka näyttää yksittäisen näytöksen ja jakamisnapin
            <ShareShow key={s.ID} show={s} tmdbId={tmdbId} />
          ))}
        </ul>
      </div>
    </div>
  )
}