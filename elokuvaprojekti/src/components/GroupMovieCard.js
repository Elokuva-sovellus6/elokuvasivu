import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./style/GroupMovieCard.css";

export default function GroupMovieCard({ movie, userId, ownerId, onDelete }) {
  const [showFullComment, setShowFullComment] = useState(false);

  const canDelete =
    String(movie.userid) === String(userId) || String(ownerId) === String(userId);

  const handleDelete = () => {
    if (window.confirm("Haluatko varmasti poistaa tämän jaon?")) {
      onDelete(movie.shareid);
    }
  };

  return (
    <>
      <div className="card shadow-sm border-0 position-relative group-movie-card">
        {/* Klikattava kuva */}
        <Link to={`/movie/${movie.tmdbid}`} className="movie-link">
          <img
            src={movie.image || "/placeholder_poster.png"}
            alt={movie.movieName}
            className="movie-poster"
          />
        </Link>

        {/* Poistonappi */}
        {canDelete && (
          <button
            type="button"
            className="btn-close delete-btn"
            aria-label="Poista"
            onClick={handleDelete}
          />
        )}

        {/* Kortin footer */}
        <div className="card-body p-2">
          <small className="text-muted d-block mb-1">
            {movie.username} jakoi elokuvan
          </small>
          <h6 className="fw-bold mb-1">{movie.movieName}</h6>

          {movie.reason && (
            <div>
              <p className="text-muted fst-italic small mb-0 comment-text">
                "{movie.reason}"
              </p>
              {movie.reason.length > 100 && (
                <button
                  className="btn btn-link p-0 small"
                  style={{ fontSize: "0.8rem" }}
                  onClick={() => setShowFullComment(true)}
                >
                  Lue lisää
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal koko kommentille */}
      {showFullComment && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
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
                <p className="fst-italic">"{movie.reason}"</p>
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
  );
}