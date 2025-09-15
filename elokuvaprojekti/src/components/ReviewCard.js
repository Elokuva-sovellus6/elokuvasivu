import React, { useState } from "react";

function ReviewCard({ text, maxLength = 100 }) {
  const [expanded, setExpanded] = useState(false); // Tila, joka määrittää, onko teksti laajennettu vai ei

  const isLong = text.length > maxLength; // Tarkistaa, onko teksti pidempi kuin maxLength
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "..."; // Näytettävä teksti riippuen tilasta

  return (
    <div
      className={"review card p-5 me-3 "}
      style={{
        maxHeight: expanded ? "none" : "250px",
        overflow: expanded ? "visible" : "hidden",
        flex : "0 0 auto",
        width: "350px",
        position: "relative",
        marginRight: "1rem",
      }}
    >
      <p style={{ margin: 0 }}>
        {displayText}{" "}
        {isLong && ( // Näytetään "Read more" -linkki vain, jos teksti on pitkä
          <span
            style={{ color: "blue", cursor: "pointer", display: "block", marginTop: "0.5rem", textDecoration: "underline" }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide" : "Read more"} {/* Näyttää tai piilottaa laajennetun tekstin */}
          </span>
        )}
      </p>
    </div>
  );
}

export default ReviewCard;
