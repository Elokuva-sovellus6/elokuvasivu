import React, { useState, useEffect } from 'react';
import { useNavigate, Link  } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { searchMovies, getPopularMovies } from '../api/moviedb.js';

export default function Navbar() {
  const [movies, setMovies] = useState([]) // Elokuvahakun tulokset
  const [query, setQuery] = useState('') // Hakukysely
  const [showDropdown, setShowDropdown] = useState(false); // Dropdownin näkyvyys

  // Haetaan elokuvat aina kun hakukysely muuttuu
  useEffect(() => {
    if (query.trim().length > 0) {
      searchMovies(query)
        .then(({ results }) => {
          setMovies(results);
          setShowDropdown(true);
        })
        .catch((err) => console.error(err));
    } else {
      setMovies([]);
      setShowDropdown(false);
    }
  }, [query]);

  const navigate = useNavigate();

  // Käsittelijä, kun käyttäjä valitsee elokuvan hakuehdotuksista
  const handleSelectMovie = (movie) => {
    navigate(`/movie/${movie.id}`);
    setShowDropdown(false);
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Logo</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">

          <form className="d-flex" role="search">
            <input 
            className="form-control me-2" 
            type="search" 
            placeholder="Search" 
            aria-label="Search" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            />

            {/* <button className="btn btn-outline-success" type="submit">Search</button> */}
          </form>
          {/* Dropdown ehdotuksille */}
          {showDropdown && movies.length > 0 && (
            <ul
              className="list-group position-absolute w-100"
              style={{ top: "100%", zIndex: 1000 }}
            >
              {movies.map((movie) => (
                <li
                  key={movie.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelectMovie(movie)}
                  style={{ cursor: "pointer" }}
                >
                  {movie.title}
                </li>
              ))}
            </ul>
          )}

          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/shows">Shows</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/group">Group</Link>
            </li>
          </ul>
          
          <form className="d-flex ms-3" role="login">
            <input className="form-control me-2" type="text" placeholder="Username" aria-label="Username"/>
            <input className="form-control me-2" type="password" placeholder="Password" aria-label="Password"/>
            <button className="btn btn-outline-primary" type="submit">Login</button>
            <button className="btn btn-outline-danger ms-2" type="button">Register</button>
          </form>
        </div>
      </div>
    </nav>
  );
}
