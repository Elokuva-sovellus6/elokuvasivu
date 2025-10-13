import React, { useState } from 'react';
import axios from 'axios';

const GroupEditModal = ({ onClose, groupId, initialData, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    groupimg: null
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleFileChange = (e) => {
      setFormData({ ...formData, groupimg: e.target.files[0] });
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      if (formData.groupimg) data.append('groupimg', formData.groupimg);

      const updated = await axios.put(
        `${import.meta.env.VITE_API_URL}/groups/${groupId}`,
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
      console.error('Error updating group:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Group update failed');
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title modal-content">Muokkaa ryhmää</h5>
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
                <label htmlFor="groupName" className="form-label">
                  Ryhmän nimi
                </label>
                <input
                  type="text"
                  name="name"
                  id="groupName"
                  placeholder="Ryhmän nimi"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
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
                  Ryhmän kuva
                </label>
                <input
                  type="file"
                  name="groupimg"
                  id="groupImage"
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

export default GroupEditModal;