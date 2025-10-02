import { useEffect, useState } from "react";
import { getPopularMovies } from "../api/moviedb";
import { getReviews } from "../api/review";
import { Link } from "react-router-dom";
import "../components/style/Rating.css";
import { getLatestReviews } from "../api/review";
import { getMovieDetails } from "../api/moviedb";
import ReviewCard from "../components/ReviewCard";
import axios from "axios";
import GroupCard from "../components/GroupCard";

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

//Näyttää elokuvia, arvosteluita ja ryhmiä
export default function HomeScreen() {

    const [reviews, setReviews] = useState([]);
    const [reviewMovies, setReviewMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

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

    {/* Hakee 3 suosituinta elokuvaa ja niiden arvostelut TMDB:stä */}
    useEffect(() => {
      const fetchPopularWithReviews = async () => {
        try {
          const popular = await getPopularMovies(1);
          const top3 = (popular.results || []).slice(0, 3);

          // Hakee elokuvien arvostelut
          const moviesWithReviews = await Promise.all(
            top3.map(async (movie) => {
              let reviews = [];
              try {
                reviews = await getReviews(movie.id);
              } catch {}
              // Hakee parhaimman arvostelun
              let bestReview = null;
              if (reviews.length > 0) {
                bestReview = reviews.reduce((best, r) =>
                  r.rating > (best?.rating || 0) ? r : best
                , null);
              }
              return {
                ...movie,
                bestReview,
              };
            })
          );
          setPopularMovies(moviesWithReviews);
        } catch (err) {
          console.error("Failed to fetch popular movies or reviews:", err);
        }
      };
      fetchPopularWithReviews();
    }, []);

    {/*Hakee uusimmat ryhmät*/}
    const [newestGroups, setNewestGroups] = useState([]);

    useEffect(() => {
      const fetchGroups = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`);
          const sorted = [...response.data].sort(
            (a, b) => new Date(b.createddate) - new Date(a.createdDate)
          );
          setNewestGroups(sorted.slice(0, 5)); //Näyttää 5 uusinta ryhmää
        } catch (err) {
          console.error("Error fetching groups:", err);
        }
      };
      fetchGroups();
    }, []);
    
    const HomeMovies = [
        {
            id: 1,
            title: "Elokuva 1",
            description: "Kuvaus elokuvasta 1",
            image: "x",
            stars: "★★★★★",
        },
        {
            id: 2,
            title: "Elokuva 2",
            description: "Kuvaus elokuvasta 2",
            image: "x",
            stars: "★★★★★",
        },
        {
            id: 3,
            title: "Elokuva 3",
            description: "Kuvaus elokuvasta 3",
            image: "x",
            stars: "★★★★★",
        },
    ];

    const HomeReviews = [
        { id: 1, user: "Käyttäjä1", text:"Suosituin arvostelu", stars: "★★★★★"},
        { id: 2, user: "Käyttäjä2", text:"Suosituin arvostelu", stars: "★★★★★"},
        { id: 3, user: "Käyttäjä3", text:"Suosituin arvostelu", stars: "★★★★★"},
    ];

    const HomeGroups = [
        "Ryhmä1", "Ryhmä2", "Ryhmä3", "Ryhmä4",
    ];

    
  return (
    <div className="container mt-4">
      <h3>Elokuvat</h3>
      <div className="row">
        {popularMovies.map((movie) => {
          {/*Rajaa elokuvan kuvauksen näytettävää osuutta*/}
          const maxLength = 200;
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
                <Link to={`/movie/${movie.id}`} className="text-decoration-none text-dark">
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
                      <span className="text-white">Ei kuvaa saatavilla</span>
                    </div>
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{movie.title}</h5>
                    {/*Jakaa arvostelun 2, jotta saadaan muunnettua TMDB:n asteikosta 10 asteikolle 5*/}
                    <StarRating rating={movie.vote_average / 2} />
                    <p className="card-text">
                      {overview
                        ? displayText
                        : <span className="text-muted">Ei kuvausta</span>} 
                    </p>
                    {/*Rajoittaa kuvausta*/}
                    {overview && isLong && (
                      <div>
                        <span
                          style={{
                            color: "blue",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={e => {
                            e.preventDefault();
                            setExpandedDescriptions(prev => ({
                              ...prev,
                              [movie.id]: !expanded
                            }));
                          }}
                        >
                          {expanded ? "Piilota" : "Lue lisää..."}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                {/* Arvostelu laatikot suosituimmille elokuville */}
                <div className="px-3 pb-3">
                  <div className="mt-3 border rounded bg-light p-3">
                    <h6 className="mb-2" style={{ fontWeight: "bold" }}>Paras arvostelu</h6>
                    {movie.bestReview ? (
                      <>
                        <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {movie.bestReview.username || "Käyttäjä"}: {movie.bestReview.rating}/5 <span>⭐</span>
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