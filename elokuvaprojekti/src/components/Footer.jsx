import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png"
import "./style/Footer.css"

export default function Footer() {

  return (
    <footer className="footer py-5">
      <div className="container">
        <div className="row">
          {/* Logo ja some-linkit */}
          <div className="col-md-4 mb-3">
            {/* HUOM: Korjasin aiemman aling-items-center kirjoitusvirheen tähän */}
            <NavLink className="navbar-brand d-flex align-items-center" to="/">
              <img 
                src={logo}
                alt="Movie fans logo"
              />
            </NavLink >
          </div>

          {/* Toinen linkkikolumni */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Linkit</h6>
            {/* MUUTOS: Lisätty d-flex ja gap-3, jotta linkit menevät riviin ja niissä on väliä */}
            <ul className="list-unstyled d-flex gap-3">
              {/* MUUTOS: nav-item poistettu, koska se pakottaa rivin */}
              <li><NavLink className="nav-link" to="/">Etusivu</NavLink ></li>
              <li><NavLink className="nav-link" to="/movies">Elokuvat</NavLink ></li>
              <li><NavLink className="nav-link" to="/shows">Näytökset</NavLink ></li>
              <li><NavLink className="nav-link" to="/groups">Ryhmät</NavLink ></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 border-top">
          <small className="text-muted">© {new Date().getFullYear()} Elokuvasivu. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}