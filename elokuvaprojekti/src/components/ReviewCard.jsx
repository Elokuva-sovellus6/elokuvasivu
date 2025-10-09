import React, { useState } from "react"
import { Link } from "react-router-dom"
import "./style/ReviewCard.css" 

function ReviewCard({ text, username, rating, date, movieTitle, movieId, maxLength = 100, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const isLong = text.length > maxLength // Tarkistaa, onko teksti pidempi kuin maksimipituus
  // Näytettävä teksti: kokonaan jos laajennettu/lyhyt, muuten typistetty
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "..." 

  return (
    <div className={`card review-card me-3 ${expanded ? 'expanded' : ''}`}>
      {/* Poistopainike näkyy vain, jos onDelete-funktio on annettu (eli omistaja voi poistaa) */}
      {onDelete && (
        <button
          type="button"
          className="btn-close delete-btn position-absolute"
          aria-label="Close"
          onClick={onDelete}
        />
      )}
      
      {/* Elokuvan nimi linkkinä elokuvakortille */}
      <div className="mb-2">
        <Link to={`/movie/${movieId}`} className="fw-bold text-decoration-none card-title">
          {movieTitle}
        </Link>
      </div>

      {/* Käyttäjä + arvosana */}
      <div className="d-flex justify-content-between mb-2 card-text">
        <strong>{username}</strong>
        <span>{rating}/5 ⭐</span>
      </div>

      {/* Arvosteluteksti */}
      <p className="review-text-content"> 
        {displayText}{" "}
        {isLong && ( // Näytä "Lue lisää/Piilota" linkki jos teksti on pitkä
          <span
            className="review-read-more" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Piilota" : "Lue lisää"} 
          </span>
        )}
      </p>

      {/* Päivämäärä */}
      <small className="text-muted card-text">{date}</small>
    </div>
  )
}

export default ReviewCard