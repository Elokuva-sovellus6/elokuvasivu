import { useParams, useLocation } from "react-router-dom"
import { useEffect, useState, useContext, useMemo } from "react"
import { getMovieDetails } from "../api/moviedb"
import { addFavourite, removeFavourite, getFavourites } from "../api/favourites"
import ReviewCard from "../components/ReviewCard"
import Rating from "../components/Rating"
import { AuthContext } from '../context/authContext.js'
import "./MoviePage.css"
import { getReviews } from "../api/review.js"
import ShowTimes from "./ShowTimes.js"
import { getShows, formatDateForAPI } from "../api/finnkino.js" // Tuo tarvittavat Finnkino funktiot

export default function MoviePage() {
  const { id: tmdbId } = useParams()
  const location = useLocation()
  
  // Aseta initial state arvoilla, tai null/default, jos puuttuvat
  const [eventId, setEventId] = useState(location.state?.eventId || null)
  const [theatreAreaId, setTheatreAreaId] = useState(location.state?.theatreAreaId || "1014")
  const [showDate, setShowDate] = useState(location.state?.showDate || getTodayDate())

  const [movie, setMovie] = useState(null)
  const [genres, setGenres] = useState([])
  const { isLoggedIn, token } = useContext(AuthContext)
  const [isFavourite, setIsFavourite] = useState(false)
  const [reviews, setReviews] = useState([])

  const API_KEY = process.env.REACT_APP_TMDB_API_KEY

  function getTodayDate() {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Hae TMDB elokuvan tiedot
  useEffect(() => {
    if (tmdbId) {
      getMovieDetails(tmdbId).then(setMovie)
    }
  }, [tmdbId])

  // Logiikka puuttuvan eventId:n hakemiseksi
  useEffect(() => {
    // Yritä hakea eventId vain jos se puuttuu ja elokuvan tiedot on ladattu
    if (!eventId && movie) {
      (async () => {
        try {
          const formattedDate = formatDateForAPI(showDate)
          // Haetaan näytökset oletusalueella ja -päivämäärällä
          const { movieShows } = await getShows(theatreAreaId, formattedDate)
          
          // Etsi oikea elokuva nimellä. Käytä karkea vertailua, koska nimissä voi olla eroja.
          const targetMovie = movieShows.find(show => 
            show.name.trim().toLowerCase() === movie.title.trim().toLowerCase()
          )
          
          if (targetMovie) {
            setEventId(targetMovie.eventId)
          } else {
             // Jos ei löydy, yritä etsiä laajemmin (esim. useampi päivä) tai vain jätä tyhjäksi.
             // Tässä versiossa tyydytään nykyiseen.
          }
        } catch (err) {
          console.error("Virhe eventId:n hakemisessa:", err)
        }
      })()
    }
  }, [eventId, movie, theatreAreaId, showDate])


  // Hae genret TMDB:stä
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`)
        const data = await res.json()
        setGenres(data.genres)
      } catch (err) {
        console.error(err)
      }
    }
    fetchGenres()
  }, [API_KEY])

  // Hae arvostelut
  useEffect(() => {
    if (tmdbId) {
      getReviews(tmdbId)
        .then(data => setReviews(data))
        .catch(err => console.error(err))
    }
  }, [tmdbId])

  // Tarkista suosikki
  useEffect(() => {
    if (isLoggedIn && tmdbId) {
      getFavourites().then(favs => {
        setIsFavourite(favs.some(f => String(f.tmdbid) === String(tmdbId)))
      })
    }
  }, [tmdbId, isLoggedIn])

  // Suosikin vaihtaminen
  const toggleFavourite = async () => {
    try {
      if (isFavourite) {
        await removeFavourite(tmdbId)
        setIsFavourite(false)
      } else {
        await addFavourite(tmdbId)
        setIsFavourite(true)
      }
    } catch (err) {
      alert('Virhe suosikin käsittelyssä')
    }
  }

  // Genre map (muistioitu)
  const genreMap = useMemo(
    () => Object.fromEntries((genres || []).map(g => [g.id, g.name])),
    [genres]
  )

  if (!movie) return <p>Ladataan...</p>

  const genreNames = movie.genres?.map(g => g.name) || []

  return (
    <div className="container py-4">
      <section className="movie-section row mb-5">
        <div className="col-md-4 text-center">
          <div className="img bg-secondary mb-3 d-flex justify-content-center align-items-center">
            <img
              className="card-img-top movie-img"
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
          </div>
          <div className="buttons d-flex gap-2">
            <button className="btn btn-primary">Share</button>
            <button
              className={`btn ${isFavourite ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={toggleFavourite}
            >
              {isFavourite ? 'Suosikki' : 'Lisää suosikiksi'}
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <h2>{movie.title}</h2>
          {movie.release_date && (
            <p className="card-text">
              <strong>Release Year:</strong> {new Date(movie.release_date).getFullYear()}
            </p>
          )}
          <p className="card-text">
            <strong>Genre:</strong> {genreNames.length > 0 ? genreNames.join(", ") : "Ei määritelty"}
          </p>
          <p><strong>Description:</strong> {movie.overview}</p>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews-section mb-5">
        <h3 className="mb-3">Top Reviews</h3>
        <div className="reviews-scroll d-flex overflow-auto">
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <ReviewCard
                key={r.reviewid}
                text={r.reviewtext}
                username={r.username}
                rating={r.rating}
                date={new Date(r.reviewdate).toLocaleDateString("fi-FI")}
              />
            ))
          )}
        </div>
      </section>

      {/* RATING & SHOWTIMES */}
      <section className="rating-section row mb-5">
        <div className="col-md-6 p-5 border rounded">
          <Rating movieId={tmdbId} token={token} />
        </div>
        <div className="col-md-6">
          <div className="schedule p-5 border rounded">
            <h4>Showtimes</h4>
            <ShowTimes 
              eventId={eventId}
              defaultArea={theatreAreaId} 
              defaultDate={showDate}
            />
          </div>
        </div>
      </section>
    </div>
  )
}