import React, { useState } from "react"
import { Link } from "react-router-dom"
import "./style/ReviewCard.css" 

function ReviewCard({ text, username, rating, date, movieTitle, movieId, maxLength = 100, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const isLong = text.length > maxLength // Tarkistaa, onko teksti pidempi kuin maksimipituus
  // Näytettävä teksti: kokonaan jos laajennettu/lyhyt, muuten typistetty
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "..." 

  return (
<div className={`card review-card position-relative ${expanded ? "expanded" : ""}`}>
      
      {/* Poistopainike */}
      {onDelete && (
        <button
          type="button"
          className="delete-btn position-absolute top-0 end-0 m-2"
          aria-label="Poista arvostelu"
          onClick={onDelete}
        >
          <i className="bi bi-trash-fill text-danger"></i>
        </button>
      )}

      <div className="card-body d-flex flex-column justify-content-between h-100">

        {/* Elokuvan nimi, käyttäjä ja arvosana */}
        <div>
          <div className="mb-2">
            <Link to={`/movie/${movieId}`} className="fw-bold text-decoration-none card-title">
              {movieTitle}
            </Link>
          </div>

          <div className="d-flex justify-content-between mb-2 card-text">
            <strong>{username}</strong>
            <span>{rating}/5 ⭐</span>
          </div>

          {/* Arvosteluteksti */}
          <div className="review-text-area mb-3">
            <p className="review-text-content mb-0">
              {displayText}{" "}
              {isLong && (
                <span
                  className="review-read-more"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Piilota" : "Lue lisää"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Päivämäärä vasemmassa alakulmassa */}
        <div className="d-flex justify-content-start align-items-end mt-auto">
          <small className="text-muted card-date card-text">{date}</small>
        </div>

      </div>
    </div>
  )
}
export default ReviewCard