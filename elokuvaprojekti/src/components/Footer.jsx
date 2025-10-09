import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png"
import "./style/Footer.css"

export default function Footer() {

  return (
    <footer className="footer py-5">
      <div className="container">
        <div className="row">
          {/* Logo linkki etusivulle*/}
          <div className="col-md-4 mb-3">
            <NavLink className="navbar-brand d-flex align-items-center" to="/">
              <img 
                src={logo}
                alt="Movie fans logo"
              />
            </NavLink >
          </div>

          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Linkit</h6>
            <ul className="list-unstyled d-flex gap-3">
              <li><NavLink className="nav-link" to="/">Etusivu</NavLink ></li>
              <li><NavLink className="nav-link" to="/movies">Elokuvat</NavLink ></li>
              <li><NavLink className="nav-link" to="/shows">Näytökset</NavLink ></li>
              <li><NavLink className="nav-link" to="/groups">Ryhmät</NavLink ></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 border-top">
          <small className="text-muted card-text">© {new Date().getFullYear()} Elokuvasivu. Kaikki oikeudet pidätetään.</small>
        </div>
      </div>
    </footer>
  );
}