import { useEffect, useState } from "react"
import { getTheatreAreas, getShows, formatDateForAPI } from "../api/finnkino.js"
import GenericDropdown from "./Dropdown.js"
import "./ShowTimes.css"

export default function ShowTimes({ eventId, defaultArea, defaultDate }) {
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
    // Keskeyttää jos eventId puuttuu (MoviePage hakee tarvittaessa)
    if (!eventId) {
      setShows([])
      return
    }

    const fetchShows = async () => {
      setIsLoading(true) // Asetetaan lataustila päälle ennen hakua koska joskus haussa kestää
      setShows([])
      
      try {
        const dateForAPI = formatDateForAPI(selectedDate)
        const { movieShows } = await getShows(selectedArea, dateForAPI)

        // Suodattaa vaan annetun elokuvan näytökset eventId:n perusteella
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

    // Ladataan näytettävä sisältö erilliseen muuttujaan
    const content = () => {
      if (isLoading) {
        return <p>Ladataan näytöksiä...</p>
      }
      
      if (shows.length === 0) {
        return <p>Ei näytöksiä valitulle päivälle.</p>
      }

  return (
      <ul className="list-group">
        {shows.map((s) => (
          <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="text-truncate me-2">
              {s.theatre}
            </div>
            <div className="text-nowrap">
              <strong>
                {new Date(s.time).toLocaleTimeString("fi-FI", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </div>
          </li>
        ))}
      </ul>
    )
  }
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
      
      {/* Scroll-alue käyttää uutta content-funktiota */}
      <div className="showtimes-scroll">
        {content()}
      </div>
    </div>
  )
}