import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './GroupPage.css';

export default function GroupPage() {
  const { groupId } = useParams()
    const [group, setGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGroup = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}`)
            setGroup(response.data)
            setLoading(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch group data')
            setLoading(false)
        }
    }

    if (groupId) {
        fetchGroup()
    }
  }, [groupId])

  return (
  <div className="groupscreen">
    {loading && <p>Loading group...</p>}
    {error && <p style={{ color: "red" }}>{error}</p>}

    {group && (
      <>
        {/* Ryhmän tiedot */}
        <section className="group-header">
          <div className="group-image"></div>
          <div className="group-info">
            <h1>{group.name}</h1>
            <p>{group.description}</p>
          </div>
        </section>

        {/* Ryhmän suosikkielokuvat */}
        <section className="favourites">
          <h2>Ryhmän suosikkielokuvat</h2>
          <div className="favourite-list">
            <div className="movie-card">
              <div className="movie-image"></div>
              <div className="movie-title">Elokuva 1</div>
            </div>
            <div className="movie-card">
              <div className="movie-image"></div>
              <div className="movie-title">Elokuva 2</div>
            </div>
            <div className="movie-card">
              <div className="movie-image"></div>
              <div className="movie-title">Elokuva 3</div>
            </div>
          </div>
        </section>

        <div className="middle-content">
          {/* Foorumi */}
          <section className="forum">
            <h2>Foorumi</h2>
            <div className="forum-messages">Foorumi</div>
            <textarea placeholder="Kirjoita viesti"></textarea>
            <button>Lähetä</button>
          </section>

          {/* Jäsenet */}
          <section className="members">
            <h2>Ryhmän jäsenet</h2>
            <div className="member-list">Jäsenet</div>
            <input type="text" placeholder="Lisää jäsen" />
            <button>Lähetä liittymispyyntö</button>
          </section>
        </div>

        <footer className="footer">Elokuvasovellus</footer>
      </>
    )}
  </div>
)
}