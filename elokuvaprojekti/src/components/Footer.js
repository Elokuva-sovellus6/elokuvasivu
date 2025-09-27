import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Footer() {
  return (
    <footer className="bg-light text-dark py-5 mt-auto border-top">
      <div className="container">
        <div className="row">
          {/* Logo ja some-linkit */}
          <div className="col-md-4 mb-3">
            <h5 className="mb-3">Logo</h5>
            <p className="text-muted">Description placeholder.</p>
            <div>
              <a href="#" className="text-dark me-3">Instagram</a>
              <a href="#" className="text-dark me-3">Facebook</a>
              <a href="#" className="text-dark">Twitter</a>
            </div>
          </div>

          {/* Ensimmäinen linkkikolumni */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">About</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-dark text-decoration-none">About Us</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Contact Us</a></li>
            </ul>
          </div>

          {/* Toinen linkkikolumni */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-dark text-decoration-none">Home</a></li>
              <li><a href="/movies" className="text-dark text-decoration-none">Movies</a></li>
              <li><a href="/groups" className="text-dark text-decoration-none">Groups</a></li>
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