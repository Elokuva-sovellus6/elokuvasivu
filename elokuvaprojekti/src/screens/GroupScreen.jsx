import React, { useState, useEffect } from 'react';
import "./style/GroupScreen.css"
import CreateGroupModal from '../components/CreateGroupModal.jsx';
import axios from 'axios';
import GroupSearchBar from '../components/GroupSearchBar.jsx';
import GroupCard from "../components/GroupCard.jsx";
import Pagination from '../components/Pagination.jsx';

export default function GroupScreen() {
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
    const [allGroups, setAllGroups] = useState([])
    const [newestGroups, setNewestGroups] = useState([])
    const [popularGroups, setPopularGroups] = useState([])

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9

    // Haetaan kaikki ryhmät kerran sivua ladattaessa
    useEffect(() => {
    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`)

            // Haetaan kaikki ryhmät
            setAllGroups(response.data)

            // Haetaan uusimmat ryhmät
            const newest = response.data
              .sort((a, b) => new Date(b.createddate) - new Date(a.createddate))
              .slice(0, 10)
            setNewestGroups(newest)

            // Haetaan suosituimmat ryhmät
            const popular = [...response.data]
              .sort((a, b) => b.memberCount - a.memberCount)
              .slice(0, 5)
            setPopularGroups(popular)

    }   catch (err) {
        console.error("Error fetching groups:", err)
        }
    }

    fetchGroups()
    }, [])

    const indexOfLast = currentPage * itemsPerPage
    const indexOfFirst = indexOfLast - itemsPerPage
    const currentGroups = allGroups.slice(indexOfFirst, indexOfLast)
    const totalPages = Math.ceil(allGroups.length / itemsPerPage)

    return (
        <div className="container py-4">
            {/* Header and search bar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Ryhmät</h1>
                <button
                    className="btn btn-primary create-group-btn"
                    onClick={() => setShowCreateGroupModal(true)}
                >
                    + Luo uusi ryhmä
                </button>
            </div>
            {/* Search bar + dropdown */}
            <div className="mb-5 position-relative">
                <GroupSearchBar allGroups={allGroups} />
            </div>
            
            {/* Popular groups section */}
            <section className="popular-section mb-5">
                <h2 className="mb-3">Suositut ryhmät</h2>
                <div className="d-flex overflow-auto gap-3 pb-2">
                {popularGroups.map(group => (
                    <GroupCard key={group.groupid} group={group} />
                ))}
              </div>
            </section>

            {/* Newest groups */}
            <section className="newest-section mb-5">
              <h2 className="mb-3">Uudet ryhmät</h2>
              <div className="d-flex overflow-auto gap-3 pb-2">
                {newestGroups.map(group => (
                    <GroupCard key={group.groupid} group={group} />
                ))}
              </div>
            </section>

            {/* All groups */}
            <section className="all-section mb-5">
                <h2 className="mb-3">Kaikki ryhmät</h2>
                <div className="d-grid gap-3" style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                    maxHeight: "1350px"
                }}>
                    {currentGroups.map(group => (
                        <GroupCard key={group.groupid} group={group} />
                    ))}
                </div>

                {/* Pagination */}
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage}
                />
            </section>
            {showCreateGroupModal && <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} />}
        </div>
    )
}