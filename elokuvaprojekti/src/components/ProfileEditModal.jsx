import React, { useState } from 'react';
import axios from 'axios';

const ProfileEditModal = ({ onClose, initialData, onUpdated }) => {
  const [formData, setFormData] = useState({
    userDescription: initialData.userdescription || '',
    userImg: null
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('userDescription', formData.userDescription);
      if (formData.userImg) data.append('userImg', formData.userImg);

      const updated = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/me`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      onUpdated(updated.data);
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Profile update failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    setFormData({ ...formData, userImg: e.target.files[0] });
  };


  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title modal-content">Muokkaa profiilia</h5>
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
                <label htmlFor="profileDescription" className="form-label">
                  Kuvaus
                </label>
                <textarea
                  name="userDescription"
                  id="profileDescription"
                  placeholder="Kerro jotain itsestäsi..."
                  value={formData.userDescription}
                  onChange={handleChange}
                  className="form-control"
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="profileImage" className="form-label">
                  Profiilikuva
                </label>
                <input
                  type="file"
                  name="userImg"
                  id="profileImage"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileChange}
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

export default ProfileEditModal;