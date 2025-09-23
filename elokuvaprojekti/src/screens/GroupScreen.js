import React, { useState, useEffect } from 'react';
import "./GroupScreen.css"
import CreateGroupModal from '../components/CreateGroupModal.js';
import axios from 'axios';
import { Link } from "react-router-dom"

export default function GroupScreen() {
    const [query, setQuery] = useState('')
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
    const [sortedGroups, setSortedGroups] = useState([])

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups`)
                // järjestetään uusimmat ensin
                const sortedGroups = response.data.sort((a, b) => new Date(b.createddate) - new Date(a.createddate))
                setSortedGroups(sortedGroups)
            } catch (err) {
              console.error("Error fetching groups:", err)
            }
        }
        fetchGroups()
    }, [])

    return (
        <div className="container py-4">
            {/* Header and search bar section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Groups</h1>
                <button className="btn btn-primary create-group-btn" onClick={() => setShowCreateGroupModal(true)}>+ Create new group</button>
            </div>

            <div className="mb-5">
                <form className="d-flex" role="search">
                    <input 
                        className="form-control" 
                        type="search" 
                        placeholder="Search for groups" 
                        aria-label="Search" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>
            </div>
            
            {/* Popular groups section */}
            <section className="mb-5">
                <h2>Popular groups</h2>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {/* Placeholder for popular group cards */}
                    <div className="col">
                        <div className="card h-100">
                            <a href="#" className="text-decoration-none text-dark">
                                <img src="https://via.placeholder.com/150" className="card-img-top" alt="Placeholder group image" />
                                <div className="card-body">
                                    <h5 className="card-title">Group 1</h5>
                                    <p className="card-text">A brief description of group 1.</p>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100">
                            <a href="#" className="text-decoration-none text-dark">
                                <img src="https://via.placeholder.com/150" className="card-img-top" alt="Placeholder group image" />
                                <div className="card-body">
                                    <h5 className="card-title">Group 2</h5>
                                    <p className="card-text">A brief description of group 2.</p>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100">
                            <a href="#" className="text-decoration-none text-dark">
                                <img src="https://via.placeholder.com/150" className="card-img-top" alt="Placeholder group image" />
                                <div className="card-body">
                                    <h5 className="card-title">Group 3</h5>
                                    <p className="card-text">A brief description of group 3.</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newest groups */}
            <section>
              <h2>Newest groups</h2>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {sortedGroups.map(group => (
                    <div className="col" key={group.groupid}>
                        <div className="card h-100">
                            <Link to={`/groups/${group.groupid}`} className="text-decoration-none text-dark">
                                <img src={group.groupimg || "https://via.placeholder.com/150"} className="card-img-top" alt={group.name} />
                                <div className="card-body">
                                    <h5 className="card-title">{group.name}</h5>
                                    <p className="card-text">{group.description}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                ))}
              </div>
            </section>
            {showCreateGroupModal && <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} />}
        </div>
    )
}