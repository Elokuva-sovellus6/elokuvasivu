import { Link } from "react-router-dom";
import "./style/MovieCard.css"

export default function MovieCard({
  id,
  title,
  imageSrc,
  description,
  linkTo,
  releaseYear,
  genres,
  extraContent,
  isLink = true,
  noColWrapper = false,
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
    <div className="card-body pb-0 card-bg">
      <h5>
        <strong>{title}</strong>
      </h5>
      {releaseYear && <p className="card-text"><strong>Julkaisuvuosi:</strong> {releaseYear}</p>}
      {genres && <p className="card-text"><strong>Genre:</strong> {genres}</p>}
      {description && (
        <p className="card-text">
          <strong>Kuvaus: </strong>
          {description}
        </p>
      )}
    </div>
  )

  const LinkContent = (
    <>
      {MovieImage}
      {MovieBody}
    </>
  )

  const CardInner = (
    <div className="card movie-card movie-link h-100 w-100 shadow-sm text-dark text-decoration-none">
      {isLink && linkTo ? (
        <Link to={linkTo} className="text-dark text-decoration-none">
          {LinkContent}
        </Link>
      ) : (
        LinkContent
      )}
      {extraContent && (
        <div className="card-footer bg-white border-0 pt-0">
          {extraContent}
        </div>
      )}
    </div>
  )

  if (noColWrapper) return CardInner

  return (
    <div className="col-md-6 col-lg-4 mb-4" key={id}>
      {CardInner}
    </div>
  )
}
