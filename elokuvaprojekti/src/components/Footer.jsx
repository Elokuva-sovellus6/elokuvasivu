import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import "./style/Footer.css";

export default function Footer() {
  return (
    <footer className="footer py-4 mt-auto">
      <div className="container text-center text-md-start">
        <div className="row align-items-center justify-content-between">

          {/* Logo ja nimi */}
          <div className="col-12 col-md-4 mb-3 mb-md-0 text-center text-md-start">
            <NavLink className="navbar-brand d-inline-flex align-items-center justify-content-center" to="/">
              <img 
                src={logo}
                alt="Movie fans logo"
                className="footer-logo"
              />
            </NavLink>
          </div>

          {/* Linkit */}
          <div className="col-12 col-md-8 text-center text-md-end">
            <ul className="list-unstyled d-flex flex-wrap justify-content-center justify-content-md-end gap-3 mb-0">
              <li><NavLink className="nav-link p-0" to="/">Etusivu</NavLink></li>
              <li><NavLink className="nav-link p-0" to="/movies">Elokuvat</NavLink></li>
              <li><NavLink className="nav-link p-0" to="/shows">Näytökset</NavLink></li>
              <li><NavLink className="nav-link p-0" to="/groups">Ryhmät</NavLink></li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center pt-3 border-top mt-3">
          <small className="text-muted">© {new Date().getFullYear()} Elokuvasivu. Kaikki oikeudet pidätetään.</small>
        </div>
      </div>
    </footer>
  );
}