import { useParams, useLocation } from "react-router-dom"
import { useEffect, useState, useContext, useMemo } from "react"
import { getMovieDetails } from "../api/moviedb.jsx"
import { addFavourite, removeFavourite, getFavourites } from "../api/favourites.jsx"
import { getReviews } from "../api/review.jsx"
import { getShows, formatDateForAPI } from "../api/finnkino.jsx" 
import { AuthContext } from '../context/authContext.jsx'
import ReviewCard from "./ReviewCard.jsx"
import Rating from "../components/Rating.jsx"
import ShowTimes from "./ShowTimes.jsx"
import ShareMovieModal from "./ShareMovieModal.jsx"
import Carousel from "./Carousel.jsx"
import "./style/MoviePage.css"

export default function MoviePage() {
    // Haetaan reititysparametrit ja sijaintitiedot
    const { id: tmdbId } = useParams()
    const location = useLocation()
    
    // AuthContext käyttäjän kirjautumistilan ja tokenin seuraamiseen
    const { isLoggedIn, token } = useContext(AuthContext)

    // Hakee tiedot URL:n tilasta tai käyttää oletusarvoja Finnkino-näytöksiin
    const [eventId, setEventId] = useState(location.state?.eventId || null)
    const [theatreAreaId, setTheatreAreaId] = useState(location.state?.theatreAreaId || "1014") // Oletusalue (pääkaupunkiseutu)
    const [showDate, setShowDate] = useState(location.state?.showDate || getTodayDate())

    // Elokuvan tiedot, suosikkitila ja arvostelut
    const [movie, setMovie] = useState(null)
    const [isFavourite, setIsFavourite] = useState(false)
    const [reviews, setReviews] = useState([])

    //Elokuvan jako ryhmään
    const [showShareMovieModal, setShowShareMovieModal] = useState(false);

    // Palauttaa tämän päivän päivämäärän
    function getTodayDate() {
        const today = new Date()
        return today.toISOString().split("T")[0]
    }

    // Hakee TMDB elokuvan tiedot ID:n perusteella
    useEffect(() => {
        if (tmdbId) {
            getMovieDetails(tmdbId).then(setMovie)
        }
    }, [tmdbId])

    // Hakee Finnkinon eventId, jos se puuttuu (matchataan TMDB:n nimen perusteella)
    useEffect(() => {
        // Yritetään hakea eventId vaan jos se puuttuu ja elokuvan tiedot on ladattu
        if (!eventId && movie) {
            (async () => {
                try {
                    const formattedDate = formatDateForAPI(showDate)
                    // Haetaan näytökset oletusalueella ja -päivämäärällä
                    const { movieShows } = await getShows(theatreAreaId, formattedDate)
                    
                    // Etsitään oikea elokuva nimellä. Käytetään karkeaa vertailua nimien eroavaisuuksien vuoksi.
                    const targetMovie = movieShows.find(show => 
                        show.name.trim().toLowerCase() === movie.title.trim().toLowerCase()
                    )
                    
                    if (targetMovie) {
                        setEventId(targetMovie.eventId)
                    }
                } catch (err) {
                    console.error("Virhe eventId:n hakemisessa:", err)
                }
            })()
        }
    }, [eventId, movie, theatreAreaId, showDate])

    // Hakee käyttäjän luomat arvostelut tälle elokuvalle
    useEffect(() => {
        if (tmdbId) {
            getReviews(tmdbId)
                .then(setReviews)
                .catch(err => console.error(err))
        }
    }, [tmdbId])

    // Tarkistaa onko elokuva suosikeissa
    useEffect(() => {
        if (isLoggedIn && tmdbId) {
            getFavourites().then(favs => {
                // Vertaillaan TMDB ID:tä suosikkeihin
                setIsFavourite(favs.some(f => String(f.tmdbid) === String(tmdbId)))
            })
        }
    }, [tmdbId, isLoggedIn])

    // Lisää/poistaa elokuvan suosikeista
    const toggleFavourite = async () => {
        if (!isLoggedIn) {
            alert('Kirjaudu sisään lisätäksesi suosikkeihin.')
            return
        }
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

    // Näytä latausilmoitus, kunnes elokuvatiedot on haettu
    if (!movie) return <p>Ladataan...</p>

    // Muunnetaan genre-ID:t nimiksi
    const genreNames = movie.genres?.map(g => g.name) || []

    return (
        <div className="container py-4">
            {/* Elokuvan tiedot */}
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
                        <button className="btn btn-primary" onClick={() => setShowShareMovieModal(true)}>
                            Jaa
                        </button>
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
                            <strong>Julkaisuvuosi:</strong> {new Date(movie.release_date).getFullYear()}
                        </p>
                    )}
                    <p className="card-text">
                        <strong>Genre:</strong> {genreNames.length > 0 ? genreNames.join(", ") : "Ei määritelty"}
                    </p>
                    <p><strong>Kuvaus:</strong> {movie.overview}</p>
                </div>
            </section>

            {/* Arvostelut */}
            <section className="reviews-section mb-5">
              <h3 className="mb-3">Käyttäjien arvostelut</h3>

              {reviews.length === 0 ? (
                <p>Ei vielä yhtään arvostelua</p>
              ) : (
                <div className="horizontal-list-wrapper review-carousel">
                  <Carousel>
                    {reviews.slice(0, 12).map((r) => (
                      <div key={r.reviewid} className="horizontal-scroll-item" style={{ minWidth: "280px" }}>
                        <ReviewCard
                          text={r.reviewtext}
                          username={r.username}
                          rating={r.rating}
                          date={new Date(r.reviewdate).toLocaleDateString("fi-FI")}
                          movieTitle={movie.title}
                          movieId={tmdbId}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}
            </section>

            {/* Arviointi ja näytösajat */}
            <section className="rating-showtimes-section row g-4">
                {/* Käyttäjän arviointikomponentti */}
                <div className="col-md-6 p-4 card-bg">
                    <Rating movieId={tmdbId} token={token} />
                </div>
                {/* Finnkino-näytösajat */}
                <div className="col-md-6">
                    <div className="schedule p-4 card-bg">
                        <h4>Näytösajat</h4>
                        <ShowTimes 
                            eventId={eventId}
                            defaultArea={theatreAreaId} 
                            defaultDate={showDate}
                        />
                    </div>
                </div>
            </section>

            {showShareMovieModal && (
                <ShareMovieModal
                    onClose={() => setShowShareMovieModal(false)}
                    movieData={{
                    tmdbId: tmdbId,
                    name: movie.title,
                    image: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : null,
                    url: window.location.href
                    }}
                    onShared={(res) => {
                    console.log("Elokuva jaettu:", res);
                    }}
                />
                )}
        </div>
    )
}