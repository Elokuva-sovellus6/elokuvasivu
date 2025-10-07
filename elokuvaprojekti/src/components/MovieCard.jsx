// MovieCard.js

import { Link } from "react-router-dom"
import "./style/MovieCard.css"

export default function MovieCard({
  id,
  title,
  imageSrc, // Koko kuvan URL
  description, // Kuvausteksti (valinnainen)
  linkTo, // Linkin kohde (valinnainen, esim. /movie/123)
  releaseYear, // Julkaisuvuosi (valinnainen)
  genres, // Genre(t) stringinä (valinnainen)
  extraContent, // Lisäsisältö, esim. tähdet tai näytösajat
  isLink = true, // Onko kortti linkki
}) {
  const MovieImage = imageSrc ? (
    <img
      src={imageSrc}
      className="card-img-top movie-card-img"
      alt={title || "Elokuva"}
    />
  ) : (
    <div className="card-img-top movie-card-no-img bg-secondary d-flex align-items-center justify-content-center">
      <span className="text-white">Ei kuvaa saatavilla</span>
    </div>
  )

  const MovieBody = (
    <div className="card-body">
      <h5 className="card-title">
        <strong>{title}</strong>
      </h5>

      {releaseYear && (
        <p className="card-text">
          <strong>Julkaisuvuosi:</strong> {releaseYear}
        </p>
      )}

      {genres && (
        <p className="card-text">
          <strong>Genre:</strong> {genres}
        </p>
      )}

      {description && (
        <p className="card-text">
          <strong>Kuvaus: </strong>
          {description}
        </p>
      )}

      {/* Lisäsisältö renderöidään tässä */}
      {extraContent}
    </div>
  )

  const CardContent = (
    <>
      {MovieImage}
      {MovieBody}
    </>
  )

  return (
    <div className="col-md-6 col-lg-4 mb-4 card-bg" key={id}>
      <div className="card movie-link h-100 shadow-sm text-dark text-decoration-none">
        {isLink && linkTo ? (
          <Link to={linkTo} className="text-dark text-decoration-none h-100">
            {CardContent}
          </Link>
        ) : (
          CardContent
        )}
      </div>
    </div>
  )
}