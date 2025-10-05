import { useEffect, useState } from "react";
import { getPopularMovies, getMovieDetails } from "../api/moviedb.jsx";
import { getReviews, getLatestReviews } from "../api/review.jsx";
import { Link } from "react-router-dom";
import "../components/style/Rating.css";
import ReviewCard from "../components/ReviewCard.jsx";
import axios from "axios";
import GroupCard from "../components/GroupCard.jsx";
import { Carousel } from "react-bootstrap";

// Arvostelutähdet
function StarRating({ rating }) {
  const numericRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const halfStars = numericRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;
  const stars = [];
  for (let i = 0; i < fullStars; i++) stars.push(<span key={"f" + i} className="filled">★</span>);
  for (let i = 0; i < halfStars; i++) stars.push(<span key={"h" + i} className="half">★</span>);
  for (let i = 0; i < emptyStars; i++) stars.push(<span key={"e" + i} className="empty">★</span>);
  return <span className="stars">{stars}</span>;
}

// Jakaa taulukon pienempiin osiin
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

//Näyttää elokuvia, arvosteluita ja ryhmiä
export default function HomeScreen() {
  const [reviewMovies, setReviewMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [newestGroups, setNewestGroups] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const latest = await getLatestReviews();

          // hae TMDB:stä elokuvan nimet
          const movies = await Promise.all(
            latest.map(async (r) => {
              try {
                const movie = await getMovieDetails(r.tmdbid);
                return { ...movie, ...r };
              } catch (e) {
                return { title: `Movie ID: ${r.tmdbid}`, ...r };
              }
            })
          );

          setReviewMovies(movies);
        } catch (err) {
          console.error("Failed to fetch latest reviews:", err);
        }
      };

      fetchData();
    }, []);

  // Suosituimmat elokuvat ja parhain arvostelu
  useEffect(() => {
    const fetchPopularWithReviews = async () => {
      try {
        const popular = await getPopularMovies(1);
        const moviesWithReviews = await Promise.all(
          (popular.results || []).map(async (movie) => {
            let reviews = [];
            try {
              reviews = await getReviews(movie.id);
            } catch {}
            let bestReview = null;
            if (reviews.length > 0) {
              bestReview = reviews.reduce(
                (best, r) => (r.rating > (best?.rating || 0) ? r : best),
                null
              );
            }
            return { ...movie, bestReview };
          })
        );
        setPopularMovies(moviesWithReviews);
      } catch (err) {
        console.error("Failed to fetch popular movies or reviews:", err);
      }
    };
    fetchPopularWithReviews();
  }, []);

  // Uusimmat ryhmät
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/groups`
        );
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.createddate) - new Date(a.createdDate)
        );
        setNewestGroups(sorted.slice(0, 5));
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    fetchGroups();
  }, []);

  const movieChunks = chunkArray(popularMovies.slice(0, 12), 3);

  return (
    <div className="container mt-4">
      <h3>Suosituimmat elokuvat</h3>

      {/* Bootstrapin Carousel komponentti */}
      {popularMovies.length === 0 ? (
        <p>Ladataan...</p>
      ) : (
        <Carousel interval={null} indicators={false}>
          {movieChunks.map((chunk, idx) => (
            <Carousel.Item key={idx}>
              <div className="row">
                {chunk.map((movie) => {
                  const maxLength = 200; //Rajaa kuvauksen pituutta
                  const overview = movie.overview || "";
                  const isLong = overview.length > maxLength;
                  const expanded = expandedDescriptions[movie.id] || false;
                  const displayText =
                    expanded || !isLong
                      ? overview
                      : overview.slice(0, maxLength) + "...";
                  return (
                    <div className="col-md-4 mb-4" key={movie.id}>
                      <div className="card h-100 shadow-sm">
                        <Link
                          to={`/movie/${movie.id}`}
                          className="text-decoration-none text-dark"
                        >
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                              className="card-img-top"
                              alt={movie.title}
                              style={{ height: "350px", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                              style={{ height: "350px" }}
                            >
                              <span className="text-white">Ei kuvaa</span>
                            </div>
                          )}
                          <div className="card-body">
                            <h5 className="card-title">{movie.title}</h5>
                            <StarRating rating={movie.vote_average / 2} /> {/* Jakaa 2:lla, jotta saadaan muunnettua 5 tähden asteikkoon */}
                            <p className="card-text">
                              {overview ? (
                                displayText
                              ) : (
                                <span className="text-muted">Ei kuvausta</span>
                              )}
                            </p>
                            {overview && isLong && (
                              <div>
                                <span
                                  style={{
                                    color: "blue",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setExpandedDescriptions((prev) => ({
                                      ...prev,
                                      [movie.id]: !expanded,
                                    }));
                                  }}
                                >
                                  {expanded ? "Piilota" : "Lue lisää..."}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="px-3 pb-3">
                          <div className="mt-3 border rounded bg-light p-3">
                            <h6
                              className="mb-2"
                              style={{ fontWeight: "bold" }}
                            >
                              Paras arvostelu
                            </h6>
                            {movie.bestReview ? (
                              <>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {movie.bestReview.username || "Käyttäjä"}:{" "}
                                  {movie.bestReview.rating}/5 ⭐
                                </div>
                                <div>{movie.bestReview.reviewtext}</div>
                              </>
                            ) : (
                              <div className="text-muted">Ei arvosteluja</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      <div className="container mt-4">
        {/* Arvostelut */}
        <h3 className="mt-5">Arvostelut</h3>
        <div className="d-flex overflow-auto">
          {reviewMovies.length === 0 ? (
            <p>Ei vielä arvosteluja</p>
          ) : (
            reviewMovies.map((r) => (
              <ReviewCard
                key={r.reviewid}
                text={r.reviewtext}
                username={r.username}
                rating={r.rating}
                date={new Date(r.reviewdate).toLocaleDateString("fi-FI")}
                movieTitle={r.title}
                movieId={r.tmdbid}
              />
            ))
          )}
        </div>
      </div>

      {/*Uusimmat ryhmät*/}
      <h3 className="mt-5">Uusimmat ryhmät</h3>
      <div className="d-flex overflow-auto gap-3 pb-2">
          {newestGroups.length === 0 ? (
            <p>Ei ryhmiä</p>
          ) : (
            newestGroups.map(group => (
              <GroupCard key={group.groupid} group={group} />
            ))
          )}
      </div>
    </div>
  );
}