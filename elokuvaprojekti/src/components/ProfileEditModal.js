import React, { useState } from 'react';
import axios from 'axios';
import { updateUserProfile } from '../api/user';

const ProfileEditModal = ({ onClose, initialData, onUpdated }) => {
  const [formData, setFormData] = useState({
    userDescription: initialData.userdescription || '',
    userImg: initialData.userimg || ''
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
        `${process.env.REACT_APP_API_URL}/users/me`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated(updated.data);
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title">Edit profile</h5>
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
                  Description
                </label>
                <textarea
                  name="userDescription"
                  id="profileDescription"
                  placeholder="Tell something about yourself..."
                  value={formData.userDescription}
                  onChange={handleChange}
                  className="form-control"
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="profileImage" className="form-label">
                  Image URL
                </label>
                <input
                  type="text"
                  name="userImg"
                  id="profileImage"
                  placeholder="Image URL"
                  value={formData.userImg}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mt-2"
              >
                Save changes
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