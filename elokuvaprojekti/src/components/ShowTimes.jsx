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

  // Hakee ja suodattaa näytökset kun alue, päivä tai eventId muuttuu
  useEffect(() => {
    if (!eventId) {
      setShows([])
      return
    }

    const fetchShows = async () => {
      setIsLoading(true)
      setShows([])
      
      try {
        const dateForAPI = formatDateForAPI(selectedDate)
        const { movieShows } = await getShows(selectedArea, dateForAPI)
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
  }, [selectedArea, selectedDate, eventId])

  return (
    <div className="showtimes-card">
      <div className="row g-2 mb-3 align-items-center">
        <div className="col-6">
          <GenericDropdown
            label="Valitse teatteri"
            items={areas}
            selected={selectedArea}
            onSelect={setSelectedArea}
            itemKey="id"
            itemLabel="name"
          />
        </div>

        <div className="col-6">
          <input
            type="date"
            className="form-control w-100"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <p>Ladataan näytöksiä...</p>}
      {!isLoading && shows.length === 0 && <p>Ei näytöksiä valitulle päivälle.</p>}

      <ul className="list-group">
        {shows.map((s, idx) => (
          <li key={idx} className="list-group-item">
            <ShareShow show={s} tmdbId={tmdbId} />
          </li>
        ))}
      </ul>
    </div>
  )
}
