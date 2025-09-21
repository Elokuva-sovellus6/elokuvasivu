import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileScreen.css';
import { getUserProfile, deleteUserProfile } from '../api/user';
import { AuthContext } from '../context/authContext';

{/*Profiilin tiedot ja kuva*/}
function ProfileScreen() {

  const [user, setUser] = useState(null);
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile?')) return;
    try {
      await deleteUserProfile();
      logout();
      alert('Profile deleted successfully');
      navigate('/shows'); // HUOM! muuta ohjaus homescreeniin kun valmistuu
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return null;

  return (
    <div className="profilescreen-container">
      <div className="profile-header">
        <div className="profile-image-container">
          <div className="profile-image"></div>
          <button className="edit-button">Edit</button>
        </div>

        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-description">Description</p>
        </div>

        {/*Profiilin poistaminen*/}
        <button className="delete-button" onClick={handleDelete}>Delete user</button>
      </div>

      {/*Placeholderit suosikeille, arvosteluille ja ryhmille*/}
      <div className="profile-sections">
        <div className="profile-data">
          <div className="box-header">
            <h2>Favourites</h2>
            <a href="#" className="share-link">Copy link</a>
          </div>
          <p> x </p>
        </div>

        <div className="profile-data">
          <h2>Reviews</h2>
          <p> x </p>
        </div>

        <div className="profile-data">
          <h2>Groups</h2>
          <p> x </p>
        </div>
      </div>

      <footer className='footer'>
        Elokuvasovellus
      </footer>
    </div>

  );
}

export default ProfileScreen;