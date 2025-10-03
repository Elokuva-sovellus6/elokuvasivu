import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShareShowModal = ({ onClose, showData, onShared }) => {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    groupID: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [hasToken, setHasToken] = useState(false);

  const navigate = useNavigate();

  // Haetaan kirjautuneen käyttäjän ryhmät
  useEffect(() => {
    const token = localStorage.getItem('token');
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
        console.error('Virhe ryhmien haussa:', err);
        setError('Ryhmiä ei voitu hakea');
      }
    };

    fetchGroups();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Sinun täytyy kirjautua sisään jakaaksesi näytöksen.");
      return;
    }

    try {
      const payload = {
        groupID: formData.groupID,
        showID: showData.id,
        eventID: showData.eventId,
        tmdbID: showData.tmdbId || null,
        theatre: showData.theatre,
        auditorium: showData.auditorium,
        showTime: showData.time,
        reason: formData.reason,
        image: showData.image || null,
        url: showData.url || null,
        movieName: showData.name || null
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/groupshows`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onShared) onShared(res.data);
      onClose();
    } catch (err) {
      console.error('Virhe jaettaessa näytöstä:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Näytöksen jako epäonnistui');
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title">Jaa näytös ryhmälle</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {/* Näytöksen tiedot */}
            <div className="mb-3">
              <strong>{showData.name}</strong><br />
              {showData.theatre}{showData.auditorium ? `, ${showData.auditorium}` : ''}<br />
              {new Date(showData.time).toLocaleString('fi-FI', {
                dateStyle: 'short',
                timeStyle: 'short'
              })}
            </div>

            {/* Jos ei ole kirjautunut */}
            {!hasToken ? (
              <div className="alert alert-warning text-center">
                <p>Kirjaudu sisään jakaaksesi näytöksen.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Dropdown ryhmille */}
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

                {/* Perusteluteksti */}
                <div className="mb-3">
                  <label htmlFor="reason" className="form-label">Miksi jaat tämän näytöksen?</label>
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
                  Jaa näytös
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

export default ShareShowModal;