import React, { useEffect, useState } from "react";
import { getGroupMovies, deleteGroupMovie } from "../api/groupmovies";
import GroupMovieCard from "./GroupMovieCard";

export default function GroupMoviesList({ groupID, token, userId, ownerId }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4); // Näytetään aluksi 4 elokuvaa

  useEffect(() => {
    if (!groupID || !token) return;
    (async () => {
      try {
        const data = await getGroupMovies(groupID, token);
        setMovies(data);
      } catch (err) {
        console.error("Virhe haettaessa jaettuja elokuvia:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [groupID, token]);

  const handleDeleteMovie = async (shareId) => {
    try {
      await deleteGroupMovie(shareId, token);
      setMovies((prev) => prev.filter((m) => m.shareid !== shareId));
    } catch (err) {
      console.error("Virhe poistettaessa elokuvaa:", err);
      alert("Elokuvan poistaminen epäonnistui.");
    }
  };

  if (loading) return <p>Ladataan jaettuja elokuvia...</p>;
  if (movies.length === 0) return <p>Ryhmään ei ole vielä jaettu elokuvia.</p>;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const handleShowLess = () => {
    setVisibleCount(4);
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-3">
        {movies.slice(0, visibleCount).map((m) => (
          <GroupMovieCard
            key={m.shareid}
            movie={m}
            userId={userId}
            ownerId={ownerId}
            onDelete={handleDeleteMovie}
          />
        ))}
      </div>

      {/* Näytä lisää / vähemmän -napit */}
      <div className="text-center mt-3">
        {visibleCount < movies.length ? (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleShowMore}
          >
            Näytä lisää
          </button>
        ) : movies.length > 4 ? (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleShowLess}
          >
            Näytä vähemmän
          </button>
        ) : null}
      </div>
    </div>
  );
}