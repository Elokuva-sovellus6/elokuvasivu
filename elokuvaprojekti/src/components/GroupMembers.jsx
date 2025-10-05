import React from 'react'
import axios from 'axios'

export default function GroupMembers({
    groupId,
    ownerId,
    userId,
    isMember,
    members,
    setMembers,
    bannedMembers,
    setBannedMembers,
    handleMembershipAction, 
    handleError,
    isOwner,
}) {

  // --- Jäsenen poisto ja bannaaminen ---
  
  const handleKickMember = async (memberId) => {
    const durations = {
        "3": "3 päivää",
        "7": "7 päivää",
        "30": "30 päivää",
        "perma": "Pysyvä"
    }

    // Kysyy bannin kestoa bannin antajalta
    const duration = window.prompt(
      `Anna bannin kesto (3/7/30/perma):\n3 = 3 päivää, 7 = 7 päivää, 30 = 30 päivää, perma = pysyvä`,
      "3"
    )

    if (!duration || !durations[duration]) return

    const token = localStorage.getItem("token")
      try {
        // Lähettää pyynnön jäsenen poistamiseksi ja bannaamiseksi (sisältäen keston)
        await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupId}/kick/${memberId}?duration=${duration}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        // Päivittää paikallisen jäsenlistan
        setMembers(prev => prev.filter(m => m.userid !== memberId))
        alert(`Jäsen poistettu ja estetty (${durations[duration]})`)
      } catch (err) {
        console.error("Virhe:", err.response?.data || err.message)
        handleError(err.response?.data?.message || "Jäsenen poistaminen epäonnistui")
      }
    }

  // --- Bannin poisto ---

  const handleUnban = async (memberId) => {
    const token = localStorage.getItem("token")
    try {
      // Lähettää pyynnön bannin poistamiseksi
      await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupId}/unban/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` }
      })
      // Päivittää bannattujen listan
      setBannedMembers(prev => prev.filter(m => String(m.userid) !== String(memberId)))
      alert("Ban poistettu!")
    } catch (err) {
        console.error("Virhe banin poistossa:", err)
        handleError(err.response?.data?.message || "Banin poisto epäonnistui")
    }
  }

  // --- Ryhmästä eroaminen ---

  const handleLeaveClick = async () => {
    // Kutsuu ulkoista toimintoa eroamiseen. 
    // Callback päivittää jäsenlistan onnistuneen eron jälkeen.
    await handleMembershipAction((leavingUserId) => {
        setMembers(prev => prev.filter(m => String(m.userid) !== String(leavingUserId)))
    })
  }


  return (
    <section className="members">
      <h2>Ryhmän jäsenet</h2>

      <h6><strong>Ryhmän ylläpitäjä</strong></h6>
      <div className="mb-2">
        {/* Etsii ja näyttää omistajan käyttäjänimen */}
        {members.find(m => String(m.userid) === String(ownerId))?.username}
      </div>

      <h6><strong>Ryhmän jäsenet</strong></h6>
      <div>
        {/* Renderöi jäsenet (pois lukien omistaja) */}
        {members.filter(m => String(m.userid) !== String(ownerId)).map(m => (
          <div key={m.userid} className="d-flex justify-content-between align-items-center mb-2">
            <span>{m.username}</span>
            {/* Poista/Ban -nappi (näkyy vain omistajalle) */}
            {isOwner && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleKickMember(m.userid)}
              >
                Poista / Ban
              </button>
            )}
          </div>
        ))}
      </div>
            
      {/* Eroa ryhmästä -nappi */}
      {isMember && (
        <button
          className="btn btn-danger w-100 mt-2"
          onClick={handleLeaveClick}
          disabled={!userId} 
        >
          Eroa ryhmästä
        </button>
      )}

      {/* Bannattujen jäsenten hallinta (näkyy vain omistajalle jos bannattuja on) */}
      {isOwner && bannedMembers.length > 0 && (
        <div className="mt-2">
          <label><strong>Bannatut jäsenet:</strong></label>
          <select
            defaultValue=""
            className="form-select mt-1"
            onChange={(e) => handleUnban(e.target.value)}
          >
            <option value="" disabled>Valitse jäsen banin poistamiseksi</option>
            {bannedMembers.map(m => (
              <option key={m.userid} value={m.userid}>
                {/* Näyttää bännin päättymisajan tai "Pysyvä" */}
                {m.username} ({m.banneduntil ? new Date(m.banneduntil).toLocaleDateString() : "Pysyvä"})
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  )
}
