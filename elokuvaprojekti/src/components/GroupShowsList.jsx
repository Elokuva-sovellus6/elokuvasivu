import React, { useState } from "react";
import GroupShowCard from "./GroupShowCard.jsx";

export default function GroupShowsList({ shows, userId, ownerId, onDelete }) {
  const [visibleCount, setVisibleCount] = useState(4);

  if (!shows || shows.length === 0) {
    return <p>Ei jaettuja näytöksiä vielä.</p>;
  }

  return (
    <div>
      <div className="row">
        {shows.slice(0, visibleCount).map((show) => (
          <div key={show.shareid} className="col-md-6 d-flex">
            <GroupShowCard
              key={show.shareid}
              show={show}
              userId={userId}
              ownerId={ownerId}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      {/* Näytä lisää / vähemmän -napit */}
      <div className="text-center mt-3">
        {visibleCount < shows.length ? (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setVisibleCount((prev) => prev + 4)}
          >
            Näytä lisää
          </button>
        ) : shows.length > 4 ? (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setVisibleCount(4)}
          >
            Näytä vähemmän
          </button>
        ) : null}
      </div>
    </div>
  );
}