import React, { useState } from "react"
import { Link } from "react-router-dom"
import "./style/GroupMovieCard.css"

export default function GroupMovieCard({ movie, userId, ownerId, onDelete }) {
  const [showFullComment, setShowFullComment] = useState(false)

  // Tarkistaa voiko käyttäjä poistaa jaon (jakaja tai ryhmän omistaja)
  const canDelete =
    String(movie.userid) === String(userId) || String(ownerId) === String(userId)

  // Käsittelee jaon poiston
  const handleDelete = () => {
    if (window.confirm("Haluatko varmasti poistaa tämän jaon?")) {
      onDelete(movie.shareid)
    }
  }

  return (
    <>
      <div className="card shadow-sm border-0 position-relative group-movie-card">
        {/* Kuva toimii linkkinä elokuvasivulle */}
        <Link to={`/movie/${movie.tmdbid}`} className="movie-link">
          <img
            src={movie.image || "/placeholder_poster.png"}
            alt={movie.movieName}
            className="movie-poster"
          />
        </Link>

        {/* Poistonappi, näytetään vaan jos käyttäjä voi poistaa */}
        {canDelete && (
          <button
            type="button"
            className="delete-btn position-absolute top-0 end-0 m-2"
            aria-label="Poista"
            onClick={handleDelete}
          >
            <i className="bi bi-trash-fill text-danger"></i>
          </button>
        )}

        {/* Kortin tiedot */}
        <div className="card-body p-2">
          <small className="text-muted d-block mb-1 card-text">
            {movie.username} jakoi elokuvan
          </small>
          <h6 className="fw-bold mb-1 card-title">{movie.movieName}</h6>

          {/* Syy/Kommentti ja Lue lisää -painike */}
          {movie.reason && (
            <div>
              <p className="text-muted fst-italic small mb-0 comment-text card-text">
                "{movie.reason}"
              </p>
              {/* Näytä "Lue lisää" vain jos kommentti on pidempi kuin 100 merkkiä */}
              {movie.reason.length > 100 && (
                <button
                  className="btn p-0 small"
                  onClick={() => setShowFullComment(true)}
                >
                  Lue lisää
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal koko kommentille, näytetään showFullComment-tilasta riippuen */}
      {showFullComment && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded">
              <div className="modal-header">
                <h5 className="modal-title">Kommentti</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFullComment(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="fst-italic card-text-black">"{movie.reason}"</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowFullComment(false)}
                >
                  Sulje
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}