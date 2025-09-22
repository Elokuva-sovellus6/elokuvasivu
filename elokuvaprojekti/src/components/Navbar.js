import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from '../context/authContext.js';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { searchMovies } from '../api/moviedb.js';
import RegisterModal from './RegisterModal';
import axios from 'axios';

export default function Navbar() {
  const [movies, setMovies] = useState([])
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  // Hakee elokuvat kun query muuttuu
  useEffect(() => {
    if (query.trim().length > 0) {
     searchMovies(query)
      .then(({ results }) => {
        setMovies(results)
        setShowDropdown(true)
      })
       .catch((err) => console.error(err))
    } else {
      setMovies([])
      setShowDropdown(false)
    }
  }, [query])

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const navigate = useNavigate()
  const { isLoggedIn, username, login, logout } = useContext(AuthContext)

  const handleSelectMovie = (movie) => {
    navigate(`/movie/${movie.id}`)
    setShowDropdown(false)
  }

  const handleRegisterClick = () => {
    setShowRegisterModal(true)
  }

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false)
  }

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, loginData)
      login(response.data.token, response.data.username)
    } catch (error) {
      alert('Invalid email or password')
    }
  }

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
          </form>
          {showDropdown && movies.length > 0 && (
            <ul className="list-group position-absolute w-100" style={{ top: "100%", zIndex: 1000 }}>
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
            <li className="nav-item"><Link className="nav-link active" aria-current="page" to="/">Home</Link></li>
            {/*<li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>*/}
            <li className="nav-item"><Link className="nav-link" to="/shows">Shows</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/group">Group</Link></li>
            {isLoggedIn && (
              <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
            )}
          </ul>
          
          {/* Login/Logout näkymä */}
          {!isLoggedIn ? (
            <div className="d-flex ms-3">
              <form className="d-flex" role="login" onSubmit={handleLoginSubmit}>
                <input
                  className="form-control me-2"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />
                <input
                  className="form-control me-2"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                />
                <button className="btn btn-outline-primary" type="submit">Login</button>
              
                <button 
                  className="btn btn-outline-danger ms-2"
                  onClick={handleRegisterClick}
                  type="button"
                >
                  Register
                </button>
              </form>
            </div>
          ) : (
            <div className="d-flex ms-3 align-items-center">
              <span className="navbar-text me-2">Welcome, {username}!</span>
              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  logout()
                  navigate('/shows') // HUOM! muuta ohjaus homescreeniin kun valmistuu
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    {showRegisterModal && <RegisterModal onClose={handleCloseRegisterModal} />}
    </nav>
  );
}