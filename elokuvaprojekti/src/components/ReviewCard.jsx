import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./style/ReviewCard.css"; 

function ReviewCard({ text, username, rating, date, movieTitle, movieId, maxLength = 100, onDelete }) {
  const [expanded, setExpanded] = useState(false); 

  const isLong = text.length > maxLength; 
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "..."; 

  // HUOM: Vain ehdolliset tyylit jätetty, ja niistä on poistettu puolipisteet.
  return (
    <div className={`card review-card me-3 ${expanded ? 'expanded' : ''}`}>
      {/* Poistopainike oikeassa yläkulmassa */}
      {onDelete && (
        <button
          type="button"
          className="btn-close position-absolute review-delete-btn"
          aria-label="Close"
          onClick={onDelete}
        />
      )}
      
      {/* Elokuvan nimi linkkinä */}
      <div className="mb-2">
        <Link to={`/movie/${movieId}`} className="fw-bold text-decoration-none">
          {movieTitle}
        </Link>
      </div>

      {/* Käyttäjä + arvosana */}
      <div className="d-flex justify-content-between mb-2">
        <strong>{username}</strong>
        <span>{rating}/5 ⭐</span>
      </div>

      {/* Arvosteluteksti */}
      {/* POISTETTU INLINE STYLE `margin: 0` -> käytetään CSS-luokkaa tai suoraa CSS:ää */}
      <p className="review-text-content"> 
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

      {/* Alarivi: päivämäärä */}
      <small className="text-muted">{date}</small>
    </div>
  );
}

export default ReviewCard;