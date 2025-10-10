import { useState, useEffect } from "react"
import axios from "axios"
import GroupCard from "../components/GroupCard.jsx"
import Carousel from "../components/Carousel.jsx"
import Pagination from "../components/Pagination.jsx"
import GroupSearchBar from "../components/GroupSearchBar.jsx"
import CreateGroupModal from "../components/CreateGroupModal.jsx"
import "./style/GroupScreen.css"

export default function GroupScreen() {
  const [allGroups, setAllGroups] = useState([])
  const [newestGroups, setNewestGroups] = useState([])
  const [popularGroups, setPopularGroups] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const itemsPerPage = 8

    // Hakee kaikki ryhmät ja sorttaa ne eri tavoin
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/groups`)
            
          // Muunnetaan memberCount numeroksi heti datan saavuttua
          const data = response.data.map(group => ({
            ...group,
              memberCount: parseInt(group.membercount, 10) 
            }))

            setAllGroups(data);

            // Uusimmat ryhmät: lajitellaan luomisajan mukaan
            const sortedNewest = [...data]
                .sort((a, b) => new Date(b.createddate) - new Date(a.createddate))
                .slice(0, 12);
            setNewestGroups(sortedNewest);

            // Suosituimmat ryhmät: lajitellaan jäsenmäärän mukaan
            const sortedPopular = [...data]
                .sort((a, b) => b.memberCount - a.memberCount) 
                .slice(0, 12);
            setPopularGroups(sortedPopular);
            
        } catch (err) {
            console.error("Error fetching groups:", err);
        }
    }

   // Kutsuu fetchGroupsia
   useEffect(() => {
      fetchGroups()
   }, [])

  // Kutsutaan uudelleen, kun ryhmä on luotu
  const handleGroupCreated = () => {
    setIsModalOpen(false)
    fetchGroups()
  }

  // Pagination
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentGroups = allGroups.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(allGroups.length / itemsPerPage)

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4"> 
        <h1 className="mb-0">Ryhmät</h1>

        {/* Luo uusi ryhmä painike */}
        <button 
          className="btn btn-primary w-25" 
          onClick={() => setIsModalOpen(true)}
        >
          + Luo uusi ryhmä
       </button>
      </div>

      <GroupSearchBar allGroups={allGroups} />

      {/* Suositut ryhmät */}
      <section className="mb-5">
        <h2 className="mb-3">Suositut ryhmät</h2>
        <Carousel>
          {popularGroups.map((group) => (
            <div 
                key={group.groupid}
                className="horizontal-scroll-item" 
            >
              <GroupCard group={group} />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Uusimmat ryhmät */}
      <section className="mb-5">
        <h2 className="mb-3">Uusimmat ryhmät</h2>
        <Carousel>
          {newestGroups.map((group) => (
            <div 
                key={group.groupid} 
                className="horizontal-scroll-item"
            >
              <GroupCard group={group} />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Kaikki ryhmät */}
      <section className="mb-5">
        <h2 className="mb-3">Kaikki ryhmät</h2>
        <div className="d-grid gap-3 all-groups-grid">
          {currentGroups.map((group) => (
            <GroupCard key={group.groupid} group={group} />
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </section>
      {/* Modaali joka näytetään, jos isModalOpen on tosi */}
      {isModalOpen && (
        <CreateGroupModal 
          onClose={handleGroupCreated}
        />
      )}
    </div>
  )
}