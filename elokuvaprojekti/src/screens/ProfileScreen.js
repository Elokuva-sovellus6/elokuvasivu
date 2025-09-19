import './ProfileScreen.css';

{/*Profiilin tiedot ja kuva*/}
function ProfileScreen() {
  return (
    <div className="profilescreen-container">
      <div className="profile-header">
        <div className="profile-image-container">
          <div className="profile-image"></div>
          <button className="edit-button">Edit</button>
        </div>

        <div className="profile-info">
          <h1 className="profile-username">Username</h1>
          <p className="profile-description">Description</p>
        </div>

        {/*Profiilin poistaminen*/}
        <button className="delete-button">Delete user</button>
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