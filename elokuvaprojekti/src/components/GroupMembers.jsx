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

    // Käsittelee jäsenen poistamisen ryhmästä (potku/bänni)
    const handleKickMember = async (memberId) => {
        // Sallitut bännin kestot
        const durations = {
            "3": "3 päivää",
            "7": "7 päivää",
            "30": "30 päivää",
            "perma": "Pysyvä"
        }

        // Kysy bännin kesto käyttäjältä
        const duration = window.prompt(
            `Anna bannin kesto (3/7/30/perma):\n3 = 3 päivää, 7 = 7 päivää, 30 = 30 päivää, perma = pysyvä`,
            "3"
        )

        // Estä toiminto, jos kestoa ei valittu tai se on virheellinen
        if (!duration || !durations[duration]) return

        const token = localStorage.getItem("token")
          try {
            // Poistaa jäsenen ja asettaa bännin
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupId}/kick/${memberId}?duration=${duration}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            // Poistaa jäsenen paikallisesti members-listalta
            setMembers(prev => prev.filter(m => m.userid !== memberId))
            alert(`Jäsen poistettu ja estetty (${durations[duration]})`)
          } catch (err) {
            console.error("Virhe:", err.response?.data || err.message)
            handleError(err.response?.data?.message || "Jäsenen poistaminen epäonnistui")
          }
    }

    // Käsittelee bännin poistamisen jäseneltä
    const handleUnban = async (memberId) => {
        const token = localStorage.getItem("token")
        try {
            // Poistaa bännin palvelimelta
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${groupId}/unban/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Poistaa jäsenen paikallisesti bannedMembers-listalta
            setBannedMembers(prev => prev.filter(m => String(m.userid) !== String(memberId)))
            alert("Ban poistettu")
        } catch (err) {
            console.error("Virhe banin poistossa:", err)
            handleError(err.response?.data?.message || "Banin poisto epäonnistui")
        }
    }

    // Käsittelee ryhmästä eroamisen
    const handleLeaveClick = async () => {
        // Kutsuu handleMembershipAction-funktiota ja välittää callback-funktion jäsenten paikalliseen päivitykseen
        await handleMembershipAction((leavingUserId) => {
            setMembers(prev => prev.filter(m => String(m.userid) !== String(leavingUserId)))
        })
    }

    return (
        <section className="members card-bg p-3">
            <h5><strong>Ryhmän ylläpitäjä</strong></h5>
            <div className="mb-3 ps-3 card-text">
                {/* Etsitään ja näytetään ylläpitäjän käyttäjänimi */}
                {members.find(m => String(m.userid) === String(ownerId))?.username}
            </div>

            <h5><strong>Jäsenet</strong></h5>
            <div className="ms-3">
                {/* Listataan muut jäsenet paitsi ylläpitäjä */}
                {members.filter(m => String(m.userid) !== String(ownerId)).map(m => (
                    <div key={m.userid} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="card-text">{m.username}</span>
                        {/* Näytä poistonappi vain omistajalle */}
                        {isOwner && (
                            <button
                                className="delete-btn btn-sm"
                                onClick={() => handleKickMember(m.userid)}
                                aria-label="Poista jäsen"
                            >
                                <i className="bi bi-trash-fill"></i>
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Näyttää "Eroa ryhmästä" -napin vain jäsenille */}
            {isMember && (
                <button
                    className="btn btn-danger w-100 mt-3"
                    onClick={handleLeaveClick}
                    disabled={!userId} 
                >
                    Eroa ryhmästä
                </button>
            )}

            {/* Näyttää bannatut jäsenet ja unban-valikon vain omistajalle */}
            {isOwner && bannedMembers.length > 0 && (
                <div className="mt-3 ms-3 card-text">
                    <label><strong>Bannatut jäsenet:</strong></label>
                    <select
                        defaultValue=""
                        className="form-select mt-1"
                        onChange={(e) => handleUnban(e.target.value)}
                    >
                        <option value="" disabled>Valitse jäsen banin poistamiseksi</option>
                        {bannedMembers.map(m => (
                            <option key={m.userid} value={m.userid}>
                                {m.username} ({m.banneduntil ? new Date(m.banneduntil).toLocaleDateString() : "Pysyvä"})
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </section>
    )
}