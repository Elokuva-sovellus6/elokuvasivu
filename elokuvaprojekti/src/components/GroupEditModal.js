import React, { useState } from 'react';
import axios from 'axios';

const GroupEditModal = ({ onClose, groupId, initialData, onUpdated }) => {
  const [formData, setFormData] = useState({
    description: initialData.description || '',
    groupimg: initialData.groupimg || ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const updated = await axios.put(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated(updated.data);
      onClose();
    } catch (err) {
      console.error('Error updating group:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Group update failed');
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title">Muokkaa ryhmää</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="groupDescription" className="form-label">
                  Kuvaus
                </label>
                <textarea
                  name="description"
                  id="groupDescription"
                  placeholder="Kerro jotain ryhmästä..."
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="groupImage" className="form-label">
                  Kuvan URL
                </label>
                <input
                  type="text"
                  name="groupimg"
                  id="groupImage"
                  placeholder="Image URL"
                  value={formData.groupimg}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mt-2"
              >
                Tallenna muutokset
              </button>
              {error && <p className="text-danger mt-3">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupEditModal;