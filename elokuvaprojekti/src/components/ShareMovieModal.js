import React, { useState, useEffect } from "react";
import { addGroupMovie } from "../api/groupmovies";
import axios from "axios";

const ShareMovieModal = ({ onClose, movieData, onShared }) => {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    groupID: "",
    reason: ""
  });
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setHasToken(false);
      setGroups([]);
      return;
    }
    setHasToken(true);

    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/groups/mine`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGroups(res.data);
      } catch (err) {
        console.error("Virhe ryhmien haussa:", err);
        setError("Ryhmiä ei voitu hakea");
      }
    };

    fetchGroups();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Sinun täytyy kirjautua sisään jakaaksesi elokuvan.");
      return;
    }

    try {
      const payload = {
        groupID: formData.groupID,
        tmdbID: movieData.tmdbId,
        movieName: movieData.name,
        image: movieData.image || null,
        url: movieData.url || null,
        reason: formData.reason
      };

      const newShare = await addGroupMovie(payload, token);  // 👈 API-kutsu

      if (onShared) onShared(newShare);
      onClose();
    } catch (err) {
      console.error("Virhe jaettaessa elokuvaa:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Elokuvan jako epäonnistui");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title">Jaa elokuva ryhmälle</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3 text-center">
              {movieData.image && (
                <img
                  src={movieData.image}
                  alt={movieData.name}
                  style={{ maxWidth: "150px", borderRadius: "10px" }}
                  className="mb-2"
                />
              )}
              <div><strong>{movieData.name}</strong></div>
            </div>

            {!hasToken ? (
              <div className="alert alert-warning text-center">
                <p>Kirjaudu sisään jakaaksesi elokuvan.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="groupID" className="form-label">Valitse ryhmä</label>
                  <select
                    name="groupID"
                    id="groupID"
                    value={formData.groupID}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">-- Valitse ryhmä --</option>
                    {groups.map((group) => (
                      <option key={group.groupid} value={group.groupid}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="reason" className="form-label">Miksi jaat tämän elokuvan?</label>
                  <textarea
                    name="reason"
                    id="reason"
                    placeholder="Kirjoita perustelusi..."
                    value={formData.reason}
                    onChange={handleChange}
                    className="form-control"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-2">
                  Jaa elokuva
                </button>
                {error && <p className="text-danger mt-3">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareMovieModal;