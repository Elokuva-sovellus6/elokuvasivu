import React, { useState } from "react";
import { Link } from "react-router-dom";

function ReviewCard({ text, username, rating, date, movieTitle, movieId, maxLength = 100, onDelete }) {
  const [expanded, setExpanded] = useState(false); // Tila, joka määrittää, onko teksti laajennettu vai ei

  const isLong = text.length > maxLength; // Tarkistaa, onko teksti pidempi kuin maxLength
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "..."; // Näytettävä teksti riippuen tilasta

  return (
    <div
      className={"review card p-5 me-3 "}
      style={{
        maxHeight: expanded ? "none" : "350px",
        overflow: expanded ? "visible" : "hidden",
        flex : "0 0 auto",
        width: "350px",
        position: "relative",
        marginRight: "1rem",
      }}

      
    >
      {/* Poistopainike oikeassa yläkulmassa */}
      
        {onDelete && (
        <button
          type="button"
          className="btn-close position-absolute"
          style={{ top: "8px", right: "8px" }}
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
      <p style={{ margin: 0 }}>
        {displayText}{" "}
        {isLong && ( // Näytetään "Read more" -linkki vain, jos teksti on pitkä
          <span
            style={{ color: "blue", cursor: "pointer", display: "block", marginTop: "0.5rem", textDecoration: "underline" }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Piilota" : "Lue lisää"} {/* Näyttää tai piilottaa laajennetun tekstin */}
          </span>
        )}
      </p>

      {/* Alarivi: päivämäärä */}
      <small className="text-muted">{date}</small>
    </div>
  );
}

export default ReviewCard;
