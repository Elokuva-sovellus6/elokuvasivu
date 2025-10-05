import React from "react";

export default function GroupShowCard({ show, userId, ownerId, onDelete }) {
  // Käyttäjä voi poistaa jos hän on jaon tekijä TAI ryhmän omistaja
  const canDelete =
    String(userId) === String(show.userid) ||
    (ownerId && String(userId) === String(ownerId));

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Haluatko varmasti poistaa näytöksen "${show.movieName || "Tuntematon elokuva"}"?`
    );
    if (confirmed) {
      onDelete(show.shareid);
    }
  };

  return (
    <div className="card shadow-sm mb-3 h-100 position-relative">
      {/* Poistonappi oikeaan yläkulmaan, näkyy vain jos canDelete = true */}
      {canDelete && (
        <button
          type="button"
          className="btn-close position-absolute"
          style={{ top: "8px", right: "8px", opacity: 0.6 }}
          aria-label="Poista"
          onClick={handleDelete}
        ></button>
      )}

      <div className="row g-0 h-100">
        {/* Kuva vasemmalle */}
        <div className="col-4">
          {show.image && (
            <img
              src={show.image}
              className="img-fluid rounded-start h-100"
              alt={show.movieName || "Elokuva"}
              style={{ objectFit: "cover" }}
            />
          )}
        </div>

        {/* Tekstit oikealle */}
        <div className="col-8">
          <div className="card-body d-flex flex-column justify-content-between h-100">
            <small className="text-muted d-block mb-1">
              {show.username} jakoi näytöksen
            </small>
            <h5 className="card-title mb-2">
              {show.movieName || "Tuntematon elokuva"}
            </h5>

            <p className="card-text mb-1">
              <strong>{show.theatre}</strong>
              {show.auditorium ? `, ${show.auditorium}` : ""}
            </p>
            <p className="card-text mb-1">
              {new Date(show.showtime).toLocaleString("fi-FI", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>           

            {/* Perusteluteksti */}
            {show.reason && (
              <p className="card-text text-muted" style={{ fontSize: "0.9rem" }}>
                "{show.reason}"
              </p>
            )}

            {/* Linkki Finnkinon sivulle */}
            {show.url && (
              <a
                href={show.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm mt-auto"
              >
                Näytä Finnkinossa
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}