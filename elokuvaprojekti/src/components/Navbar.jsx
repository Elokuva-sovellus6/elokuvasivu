import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, NavLink } from "react-router-dom"
import { AuthContext } from '../context/authContext.jsx'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "bootstrap-icons/font/bootstrap-icons.css"
import RegisterModal from './RegisterModal'
import axios from 'axios'
import logo from '../assets/logo.png'
import "./style/Navbar.css"

export default function Navbar() {
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [requests, setRequests] = useState([])
  const navigate = useNavigate()
  const { isLoggedIn, username, login, logout } = useContext(AuthContext)

  // Haetaan liittymispyynnöt, jos käyttäjä on kirjautunut (omien ryhmien osalta)
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

  // Käsittelee kirjautumislomakkeen kenttien muutokset
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  // Käsittelee kirjautumislomakkeen lähetyksen
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, loginData)
      login(response.data.token, response.data.username)
    } catch (error) {
      alert('Invalid email or password')
    }
  }

  // Käsittelee ryhmään liittymispyynnön hyväksymisen
  const handleAccept = async (requestId) => {
    const token = localStorage.getItem("token")
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/groups/join-requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Poistaa hyväksytyn pyynnön listalta
      setRequests(prev => prev.filter(r => r.requestid !== requestId))
    } catch (err) {
      console.error(err.response?.data || err.message)
      alert(err.response?.data?.message || "Virhe pyynnön hyväksymisessä")
    }
  }

  // Käsittelee ryhmään liittymispyynnön hylkäämisen
  const handleReject = async (requestId) => {
    const token = localStorage.getItem("token")
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/groups/join-requests/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Poistaa hylätyn pyynnön listalta
      setRequests(prev => prev.filter(r => r.requestid !== requestId))
    } catch (err) {
      console.error(err.response?.data || err.message)
      alert(err.response?.data?.message || "Virhe pyynnön hylkäämisessä")
    }
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        {/* Logo */}
        <NavLink className="navbar-brand d-flex aling-items-center" to="/">
          <img 
            src={logo}
            alt="Movie fans logo"
          />
        </NavLink>
        {/* Mobiilinäkymä */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Navigaatiolinkit */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className={({ isActive }) => isActive ? "nav-link active-nav" : "nav-link"} to="/">Etusivu</NavLink></li>
            <li className="nav-item"><NavLink className={({ isActive }) => isActive ? "nav-link active-nav" : "nav-link"} to="/movies">Elokuvat</NavLink></li>
            <li className="nav-item"><NavLink className={({ isActive }) => isActive ? "nav-link active-nav" : "nav-link"} to="/shows">Näytökset</NavLink></li>
            <li className="nav-item"><NavLink className={({ isActive }) => isActive ? "nav-link active-nav" : "nav-link"} to="/groups">Ryhmät</NavLink></li>
            {isLoggedIn && (
              <li className="nav-item"><NavLink className={({ isActive }) => isActive ? "nav-link active-nav" : "nav-link"} to="/profile">Profiili</NavLink></li>
            )}
          </ul>

          {/* Ilmoituskello (näkyy vain kirjautuneille) */}
          {isLoggedIn && (
            <div className="nav-item dropdown me-3 bell-wrapper">
              <button 
                className="btn position-relative no-bg"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-bell"></i>
                {/* Punainen ilmoituspallo, jos pyyntöjä on */}
                {requests.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    !
                  </span>
                )}
              </button>
              {/* Pudotusvalikko ilmoituksille */}
              <ul className="dropdown-menu dropdown-menu-end">
                {requests.length === 0 ? (
                  <li className="dropdown-item">Ei ilmoituksia</li>
                ) : (
                  requests.map(req => (
                    <li key={req.requestid} className="dropdown-item d-flex justify-content-between align-items-center">
                      <span>
                        {/* Näyttää käyttäjän ja ryhmän nimen */}
                        {req.username ?? "Tuntematon käyttäjä"} - {req.groupname ?? "Tuntematon ryhmä"}
                      </span>
                      <div>
                        {/* Hyväksy- ja Hylkää-napit pyynnöille */}
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
          
          {/* Kirjautumis-/Uloskirjautumis-näkymä */}
          {!isLoggedIn ? (
            // Kirjautumislomake ja Rekisteröidy-nappi (ei-kirjautuneille)
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
                  className="btn" 
                  type="submit"
                >
                  Kirjaudu
                </button>
              
                <button 
                  className="btn ms-2"
                  onClick={() => setShowRegisterModal(true)}
                  type="button"
                >
                  Rekisteröidy
                </button>
              </form>
            </div>
          ) : (
            // Tervetuloa-viesti ja Kirjaudu ulos -nappi (kirjautuneille)
            <div className="d-flex ms-3 align-items-center user-info-wrapper">
              <span className="navbar-text me-2">Tervetuloa, {username}!</span>
              <button
                className="btn"
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
    {/* Rekisteröintimodaali, joka näytetään/piilotetaan tilan mukaan */}
    {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </nav>
  )
}