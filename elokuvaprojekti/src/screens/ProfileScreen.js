import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserProfile, deleteUserProfile } from '../api/user';
import { getFavourites } from '../api/favourites';
import { getMovieDetails } from '../api/moviedb';
import { AuthContext } from '../context/authContext';

{/*Profiilin tiedot ja kuva*/}
function ProfileScreen() {

  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
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

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return null;

  return (

    <div className="container py-4">
      <div className="row align-items-center mb-4">
        <div className="col-md-3 text-center">
          <div className="rounded-circle bg-secondary mx-auto mb-2" style={{ width: 120, height: 120 }}></div>
          <button className="btn btn-outline-primary btn-sm">Edit</button>
        </div>
        <div className="col-md-6">
          <h1 className="display-5">{user.username}</h1>
          <p className="text-muted">Description</p>
        </div>
        <div className="col-md-3 text-end">
          <button className="btn btn-danger" onClick={handleDelete}>Delete user</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0">Favourites</h5>
              <a href="#" className="btn btn-link btn-sm">Copy link</a>
            </div>
            {favouriteMovies.length === 0 ? (
              <p className="text-muted">Ei vielä suosikkeja</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {favouriteMovies.map((movie) => (
                  <li key={movie.tmdbid}>
                    <Link to={`/movie/${movie.tmdbid}`}>{movie.title}</Link>
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
            <h5 className="card-title">Reviews</h5>
            <p className="text-muted">x</p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Groups</h5>
            <p className="text-muted">x</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;