import { useEffect, useState } from "react";
import { getLatestReviews } from "../api/review";
import { getMovieDetails } from "../api/moviedb";
import ReviewCard from "../components/ReviewCard";


//Näyttää elokuvia, arvosteluita ja ryhmiä
export default function HomeScreen() {

    const [reviews, setReviews] = useState([]);
    const [reviewMovies, setReviewMovies] = useState([]);

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
        {HomeMovies.map((movie) => (
          <div className="col-md-4 mb-4" key={movie.id}>
            <div className="card h-100 shadow-sm">
              <div
              //Näyttää kuvan harmaana placeholder laatikkona
                className="card-img-top"
                style={{
                  backgroundColor: "#ccc",
                  width: "100%",
                  height: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  color: "#555"
                }}
              >
                {movie.image === "x" ? "Placeholder" : <img src={movie.image} alt={movie.title} style={{width: "100%", height: "100%", objectFit: "cover"}} />}
              </div>
              
              <div className="card-body">
                <h5 className="card-title">{movie.title}</h5>
                <div>{movie.stars}</div>
                <p className="card-text">{movie.description}</p>
              </div>
            </div>
          </div>
        ))}
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

      <h3 className="mt-5">Ryhmät</h3>
      <div className="card p-3">
        <ul className="list-unstyled mb-0">
          {HomeGroups.map((group, idx) => (
            <li key={idx}>{group}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}