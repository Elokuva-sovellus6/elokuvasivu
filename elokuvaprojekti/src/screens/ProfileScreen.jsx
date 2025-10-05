import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserProfile, deleteUserProfile } from '../api/user.jsx';
import { getFavourites, removeFavourite } from '../api/favourites.jsx';
import { getUserReviews, deleteReview } from "../api/review.jsx";
import ReviewCard from '../components/ReviewCard.jsx';
import { getMovieDetails } from '../api/moviedb.jsx';
import { AuthContext } from '../context/authContext.jsx';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import "./style/ProfileScreen.css"

// Profiilin tiedot ja kuva
function ProfileScreen() {

  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewMovies, setReviewMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

    // Hae käyttäjä
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { logout } = useContext(AuthContext);

  const handleProfileUpdated = (upDatedUser) => {
    setUser(upDatedUser);
  }

  //Suosikkien haku ja elokuvien tietojen haku
  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const favs = await getFavourites();
        setFavourites(favs);
        // Hae suosikkielokuvan tiedot
        const movies = await Promise.all(
          favs.map(async (fav) => {
            try {
              const movie = await getMovieDetails(fav.tmdbid);
              return { ...movie, tmdbid: fav.tmdbid };
            } catch (e) {
              return { title: `Movie ID: ${fav.tmdbid}`, tmdbid: fav.tmdbid };
            }
          })
        );
        setFavouriteMovies(movies);
      } catch (err) {
        console.error('Failed to fetch favourites:', err)
      }
    };
    fetchFavourites();
  }, []);

  // Käyttäjän antamien arvostelujen haku
  useEffect(() => {
  if (user) {
    getUserReviews(user.userid)
      .then(async (reviewsData) => {
        setReviews(reviewsData);

        // Hae elokuvien nimet TMDB:stä
        const movies = await Promise.all(
          reviewsData.map(async (r) => {
            try {
              const movie = await getMovieDetails(r.tmdbid);
              return { ...movie, ...r }; // yhdistetään TMDB-tiedot arvosteluun
            } catch (e) {
              return { title: `Movie ID: ${r.tmdbid}`, ...r };
            }
          })
        );
        setReviewMovies(movies);
      })
      .catch((err) => console.error("Failed to fetch reviews:", err));
  }
}, [user]);

  // Profiilin poisto
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile?')) return;
    try {
      await deleteUserProfile();
      logout();
      alert('Profile deleted successfully');
      navigate('/');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCopyLink = () => {
    if (!user) return;
    const shareURI = `${window.location.origin}/favourites/${user.userid}/public`;
    navigator.clipboard
      .writeText(shareURI)
      .then(() => alert('Linkki kopioitu leikepöydälle!'))
      .catch(() => alert('Linkkiä ei voitu kopioida.'));
  };

  // Poista suosikki
  const handleRemoveFavourite = async (tmdbid) => {
    try {
      await removeFavourite(tmdbid);
      // Päivitä suosikit ja elokuvat
      setFavourites(favourites.filter(f => f.tmdbid !== tmdbid));
      setFavouriteMovies(favouriteMovies.filter(m => m.tmdbid !== tmdbid));
    } catch (err) {
      alert('Virhe suosikin poistossa');
    }
  };

  //Arvostelun poisto
  const handleDeleteReview = async (reviewId) => {
  if (!window.confirm("Haluatko varmasti poistaa arvostelun?")) return;
  try {
    await deleteReview(reviewId);
    setReviewMovies(reviewMovies.filter(r => r.reviewid !== reviewId));
  } catch (err) {
    alert(`Virhe arvostelun poistossa: ${err.message}`);
  }
};

  if (loading) return <p>Ladataan profiilia...</p>;
  if (error) return <p>Virhe: {error}</p>;
  if (!user) return null;

  return (

    <div className="container py-4">
      <div className="row align-items-center mb-4">
        <div className="col-md-3 text-center">
          <img
            src={
              user.userimg
                ? `${import.meta.env.VITE_API_URL}/uploads/userimg/${user.userimg}`
                : '/default.png'
            }
            alt="Profiilikuva"
            className="profile-avatar"
          />
         <button
           className="btn btn-outline-primary btn-sm"
           onClick={() => setShowEditModal(true)}
         >
           Muokkaa profiilin kuvausta ja kuvaa
         </button>
        </div>
        <div className="col-md-6">
          <h1 className="display-5">{user.username}</h1>
          <p className="text-muted">{user.userdescription || 'Ei vielä kuvausta'}</p>
        </div>
        <div className="col-md-3 text-end">
          <button className="btn btn-danger" onClick={handleDelete}>Poista käyttäjä</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Suosikit</h5>
              <button
                onClick={handleCopyLink}
                className="btn btn-link btn-sm ms-auto"
              >
                Kopioi linkki
              </button>
            </div>
            {favouriteMovies.length === 0 ? (
              <p className="text-muted">Ei vielä suosikkeja</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {favouriteMovies.map((movie) => (
                  <li
                    key={movie.tmdbid}
                    className="d-flex align-items-center mb-2"
                    style={{ gap: "0.3rem" }}
                  >
                    <Link
                      to={`/movie/${movie.tmdbid}`}
                      className="text-decoration-none"
                      style={{ fontSize: "1.1rem" }}
                    >
                      {movie.title}
                    </Link>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc3545",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: "1",
                      }}
                      onClick={() => handleRemoveFavourite(movie.tmdbid)}
                      aria-label="Poista suosikeista"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
      )}
    </div>
  </div>
</div>
      <div className="mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Arvostelut</h5>
            {reviewMovies.length === 0 ? (
              <p className="text-muted">Ei vielä arvosteluja</p>
            ) : (
              <div className="d-flex overflow-auto">
                {reviewMovies.map((r) => (
                  <ReviewCard
                    key={r.reviewid}
                    text={r.reviewtext}
                    username={user.username}
                    rating={r.rating}
                    date={new Date(r.reviewdate).toLocaleDateString("fi-FI")}
                    movieTitle={r.title}
                    movieId={r.tmdbid}
                    onDelete={() => handleDeleteReview(r.reviewid)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Ryhmät</h5>
            <p className="text-muted">x</p>
          </div>
        </div>
      </div>
      {showEditModal && (
        <ProfileEditModal
          onClose={() => setShowEditModal(false)}
          initialData={user}
          onUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}

export default ProfileScreen;