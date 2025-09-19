import React, { useState } from 'react';
import axios from 'axios';

// Rekisteröintimodaali
const RegisterModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Virheviestit
  const [error, setError] = useState('');

  // Käsittelee lomakkeen kenttien muutokset
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Käsittelee lomakkeen lähetyksen
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Lähettää rekisteröintipyynnön palvelimelle
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, formData);
      console.log(response.data.message);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title">Register</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-2">Register</button>
              {error && <p className="text-danger mt-3">{error}</p>}
            </form>
          </div>
          <div className="modal-footer d-flex justify-content-center">
            <p className="mt-2">Already have an account? <a href="#" onClick={onClose}>Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
