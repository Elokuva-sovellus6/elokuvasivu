import React, { useState } from 'react';
import axios from 'axios';

const CreateGroupModal = ({ onClose, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupimg: ''
  })

  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const token = localStorage.getItem("token")
      await axios.post(`${process.env.REACT_APP_API_URL}/groups`, formData, { headers: { Authorization: `Bearer ${token}` }})
      onClose()
    } catch (err) {
      console.error("Error creating group:", err.response?.data || err.message)
      setError(err.response?.data?.message || 'Group creation failed')
    }
  }

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content rounded-xl">
          <div className="modal-header">
            <h5 className="modal-title">Create new group</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="groupName" className="form-label">Group name</label>
                <input
                  type="text"
                  name="name"
                  id="groupName"
                  placeholder="Group Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="groupDescription" className="form-label">Description (optional)</label>
                <textarea
                  name="description"
                  id="groupDescription"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="groupImage" className="form-label">Image URL (optional)</label>
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
              <button type="submit" className="btn btn-primary w-100 mt-2">Create group</button>
              {error && <p className="text-danger mt-3">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal;