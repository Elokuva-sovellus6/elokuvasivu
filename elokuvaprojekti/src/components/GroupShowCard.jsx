import React from "react"

export default function GroupShowCard({ show, userId, ownerId, onDelete }) {

  // Käyttäjä voi poistaa jaon, jos hän on jaon tekijä tai ryhmän omistaja
  const canDelete =
    String(userId) === String(show.userid) ||
    (ownerId && String(userId) === String(ownerId))

  // Käsittelee näytöksen poiston
  const handleDelete = () => {
    const confirmed = window.confirm(
      `Haluatko varmasti poistaa näytöksen "${show.movieName || "Tuntematon elokuva"}"?`
    )
    if (confirmed) {
      onDelete(show.shareid)
    }
  }

  return (
    <div className="card shadow-sm mb-3 h-100 position-relative">
      {canDelete && (
        <button
          type="button"
          // Asetetaan painike kortin oikeaan yläkulmaan
          className="delete-btn position-absolute top-0 end-0 m-2"
          aria-label="Poista"
          onClick={handleDelete}
        >
          <i className="bi bi-trash-fill text-danger"></i>
        </button>
      )}

      <div className="row g-0 h-100">
        <div className="col-4">
          {show.image && (
            <img
              src={show.image}
              className="img-fluid rounded-start h-100 w-100"
              alt={show.movieName || "Elokuva"}
            />
          )}
        </div>
        
        <div className="col-8">
          <div className="card-body d-flex flex-column justify-content-start h-100 p-3">
            
            {/* Jakajan tiedot ja Elokuvan nimi */}
            <div className="mb-2">
              <small className="text-muted d-block mb-1 card-text">
                {show.username} jakoi näytöksen
              </small>
              <h5 className="card-title fw-bold mb-0">
                {show.movieName || "Tuntematon elokuva"}
              </h5>
            </div>

            {/* Näytöksen aika ja paikka */}
            <div className="mb-2">
              <p className="card-text small mb-0">
                <strong>{show.theatre}</strong>
                {show.auditorium ? `, ${show.auditorium}` : ""}
              </p>
              <p className="card-text small mb-0">
                {new Date(show.showtime).toLocaleString("fi-FI", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {/* Perusteluteksti */}
            {show.reason && (
              <p className="card-text text-muted fst-italic mt-auto mb-2">
                "{show.reason}"
              </p>
            )}

            {/* Linkki Finnkinon sivulle */}
            {show.url && (
              <button className="btn btn-sm mt-auto">
                <a
                  href={show.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Näytä Finnkinossa
                </a>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
