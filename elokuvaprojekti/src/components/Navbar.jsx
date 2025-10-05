import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from '../context/authContext.jsx';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import RegisterModal from './RegisterModal';
import axios from 'axios';

export default function Navbar() {
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const navigate = useNavigate()
  const { isLoggedIn, username, login, logout } = useContext(AuthContext)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [requests, setRequests] = useState([])
  

  // Haetaan liittymispyynnöt jos käyttäjä on kirjautunut
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token")
      axios.get(`${import.meta.env.VITE_API_URL}/groups/owned/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setRequests(res.data))
      .catch(err => console.error("Virhe pyyntöjen haussa", err))
    }
  }, [isLoggedIn])

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, loginData)
      login(response.data.token, response.data.username)
    } catch (error) {
      alert('Invalid email or password')
    }
  }

const handleAccept = async (requestId) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/groups/join-requests/${requestId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRequests(prev => prev.filter(r => r.requestid !== requestId));
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.message || "Virhe pyynnön hyväksymisessä");
  }
}

const handleReject = async (requestId) => {
  const token = localStorage.getItem("token");
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/groups/join-requests/${requestId}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRequests(prev => prev.filter(r => r.requestid !== requestId));
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.message || "Virhe pyynnön hylkäämisessä");
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link active" aria-current="page" to="/">Etusivu</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/movies">Elokuvat</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/shows">Näytökset</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/groups">Ryhmät</Link></li>
            {isLoggedIn && (
              <li className="nav-item"><Link className="nav-link" to="/profile">Profiili</Link></li>
            )}
          </ul>
          {/* Kello ikoni jossa näkyy ilmoitukset*/}
          {isLoggedIn && (
            <div className="nav-item dropdown me-3">
              <button 
                className="btn position-relative"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-bell" style={{ fontSize: "1.5rem" }}></i>
                {requests.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    !
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                {requests.length === 0 ? (
                  <li className="dropdown-item">Ei ilmoituksia</li>
                ) : (
                  requests.map(req => (
                    <li key={req.requestid} className="dropdown-item d-flex justify-content-between align-items-center">
                      <span>
                        {req.username ?? "Tuntematon käyttäjä"} - {req.groupname ?? "Tuntematon ryhmä"}
                      </span>
                      <div>
                        <button 
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleAccept(req.requestid)}
                        >
                          Hyväksy
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(req.requestid)}
                        >
                          Hylkää
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          
          {/* Login/Logout näkymä */}
          {!isLoggedIn ? (
            <div className="d-flex ms-3">
              <form className="d-flex" role="login" onSubmit={handleLoginSubmit}>
                <input
                  className="form-control me-2"
                  type="email"
                  name="email"
                  placeholder="Sähköposti"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />
                <input
                  className="form-control me-2"
                  type="password"
                  name="password"
                  placeholder="Salasana"
                  value={loginData.password}
                  onChange={handleLoginChange}
                />
                <button 
                  className="btn btn-outline-primary" 
                  type="submit"
                >
                    Kirjaudu
                </button>
              
                <button 
                  className="btn btn-outline-danger ms-2"
                  onClick={() => setShowRegisterModal(true)}
                  type="button"
                >
                  Rekisteröidy
                </button>
              </form>
            </div>
          ) : (
            <div className="d-flex ms-3 align-items-center">
              <span className="navbar-text me-2">Tervetuloa, {username}!</span>
              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Kirjaudu ulos
              </button>
            </div>
          )}
        </div>
      </div>
    {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </nav>
  )
}