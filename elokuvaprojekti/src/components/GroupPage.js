import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GroupMembers from './GroupMembers';
import JoinGroup from './JoinGroup';
import GroupEditModal from "../components/GroupEditModal";
import GroupShowCard from './GroupShowCard';
import './style/GroupPage.css';

export default function GroupPage() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const [group, setGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isMember, setIsMember] = useState(false)
    const [members, setMembers] = useState([])
    const [userId, setUserId] = useState(undefined)
    const [bannedMembers, setBannedMembers] = useState([])
    const [banError, setBanError] = useState(null)
    const [hasToken, setHasToken] = useState(false)
    const [joinRequestSent, setJoinRequestSent] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false);
    const [groupShows, setGroupShows] = useState([]);


    const handleError = (message) => {
        setError(message)
    }

    //Poista jaetty näytös
    const handleDeleteShow = async (shareId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Kirjaudu sisään poistaaksesi näytöksen");
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/groupshows/${shareId}`, {
            headers: { Authorization: `Bearer ${token}` }
            });

            // Päivitä state poistamalla kyseinen show
            setGroupShows((prev) => prev.filter((s) => s.shareid !== shareId));
        } catch (err) {
            console.error("Virhe poistettaessa jakoa:", err);
            alert("Poistaminen epäonnistui");
        }
        };

    // Parsii käyttäjän ID:n tokenista ja asettaa hasToken-tilan
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            setHasToken(true)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setUserId(payload.id)
            } catch (err) {
                console.error("Virhe tokenin parsinnassa:", err)
                setUserId(null)
            }
        } else {
            setHasToken(false)
            setUserId(null)
        }
    }, [])


    // Hakee ryhmän tiedot, jäsenet ja jäsenyyden tilan
    const fetchGroupAndMembers = useCallback(async () => {
        if (!groupId) return

        setLoading(true)
        setError(null)
        setBanError(null)

        const token = localStorage.getItem("token")

        try {
            // 1. Hae ryhmän perustiedot
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
            setGroup(response.data)

            setIsMember(false)
            setJoinRequestSent(false)
            setMembers([])

            // 2. Hae jäsenyys ja pyynnöt, jos käyttäjä on kirjautunut sisään
            if (token && userId) {
                try {
                    // A) Hae ryhmän jäsenet
                    const membersRes = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}/members`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setMembers(membersRes.data)

                    // Tarkista onko kirjautunut käyttäjä jäsen
                    const isUserAMember = membersRes.data.some(m => String(m.userid) === String(userId));
                    setIsMember(isUserAMember)

                    // B) Hae liittymispyynnöt (vain jos ei jäsen)
                    if (!isUserAMember) {
                        const joinRequestsRes = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}/join-requests`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const hasPendingRequest = joinRequestsRes.data.some(r => String(r.userid) === String(userId));
                        setJoinRequestSent(hasPendingRequest);
                    }
                } catch (memberError) {
                    // Jatketaan ilman jäsen-/pyyntötietoja, jos API estää pääsyn
                    console.warn("Virhe jäsenyystietojen haussa:", memberError.response?.status);
                    setIsMember(false);
                    setJoinRequestSent(false);
                    setMembers([]);
                }
            }
            setLoading(false)
        } catch (err) {
            console.error("Virhe ryhmätietojen haussa:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Ryhmän haku epäonnistui')
            setLoading(false)
        }
    }, [groupId, userId])


    // Käynnistää ryhmän latauksen, kun käyttäjä-ID on tunnettu
    useEffect(() => {
        if (userId !== undefined) {
            fetchGroupAndMembers()
        }
    }, [fetchGroupAndMembers, userId])


    // Hae bannatut jäsenet (vain ryhmän omistajalle)
    useEffect(() => {
        const fetchBannedMembers = async () => {
            if (!group || !userId || String(userId) !== String(group.ownerid)) return

            try {
                const token = localStorage.getItem("token")
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/groups/${groupId}/banned`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setBannedMembers(res.data)
            } catch (err) {
                console.error("Virhe bannattujen haussa:", err)
            }
        }

        if (group && userId) fetchBannedMembers()
    }, [group, userId, groupId])


    // Käsittelee liittymisen (pyynnön lähetyksen) tai ryhmästä eroamisen
    const handleMembershipAction = async (onLeaveCallback) => {
        const token = localStorage.getItem("token")
        if (!token) {
            alert("Sinun täytyy kirjautua sisään suorittaaksesi toiminnon.");
            return;
        }
        setError('')
        setBanError(null)
    
        const wasOwner = String(userId) === String(group?.ownerid);
    
        try {
            if (!isMember) {
                // Lähettää liittymispyyntö
                await axios.post(`${process.env.REACT_APP_API_URL}/groups/${groupId}/join-request`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                alert('Liittymispyyntö lähetetty!')
                setJoinRequestSent(true)
                setBanError(null)
            
            } else {
                // Eroa ryhmästä
                const leaveResponse = await axios.post(`${process.env.REACT_APP_API_URL}/groups/${groupId}/leave`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            
                // Tarkistaa, poistettiinko ryhmä
                if (leaveResponse.data.groupDeleted) {
                    alert('Ryhmä poistettu, koska se jäi ilman jäseniä.');
                    navigate('/'); // Ohjaa etusivulle ryhmän poiston jälkeen
                    return;
                }
            
                alert('Olet poistunut ryhmästä.')
            
                setIsMember(false)
                setJoinRequestSent(false)
            
                if (wasOwner) {
                    // Jos omistajuus siirtyi, päivittää tiedot
                    await fetchGroupAndMembers()
                } else {
                    if (onLeaveCallback) onLeaveCallback(userId)
                }
            }
        } catch (err) {
            console.error("Virhe:", err.response?.data || err.message)
        
            // Käsittelee 403 bännivirhe
            if (err.response?.status === 403 && err.response?.data?.message === "Olet estetty tästä ryhmästä") {
                setBanError({
                    message: err.response.data.message,
                    bannedUntil: err.response.data.bannedUntil 
                }) 
                setError(null)
            } else {
                // Muut virheet
                setError(err.response?.data?.message || 'Toiminto epäonnistui')
                setBanError(null)
            }
        }
    }

    // Hakee ryhmän jaetut näytökset
        useEffect(() => {
            const fetchGroupShows = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/groupshows/${groupId}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                setGroupShows(res.data);
            } catch (err) {
                console.error("Virhe jaettujen näytösten haussa:", err);
            }
            };

            if (isMember) {
            fetchGroupShows();
            }
        }, [groupId, isMember]);


    // --- Renderöinti ---

    if (loading) return <p>Ladataan Ryhmää...</p>
    if (error) return <p style={{ color: "red" }}>{error}</p>
    if (!group) return null

    const shouldShowFullContent = isMember;

    return (
        <div className="groupscreen">
            {/* Ryhmän perustiedot */}
            <section className="group-header">
                <div className="group-image">
                    <img
                      src={
                        group.groupimg
                          ? `${process.env.REACT_APP_API_URL}/uploads/groupimg/${group.groupimg}`
                          : "https://placehold.co/300x200?text=Ryhmä"
                      }
                      className="card-img-top"
                      alt={group.name}
                    />
                </div>
                <div className="group-info">
                    <h1>{group.name}</h1>
                    <p>{group.description ? group.description : "Ei vielä kuvausta"}</p>
                    {/*Ryhmän muokkauspainike, näkyy vain omistajalle */}
                    {String(userId) === String(group.ownerid) && (
                      <button
                        className="btn btn-outline-primary btn-sm ms-2"
                        onClick={() => setShowEditModal(true)}
                      >
                        Muokkaa ryhmää
                      </button>
                    )}
                </div>
            </section>

            <hr />

            {/* --- Rajoitettu näkymä (Kun ei ole jäsen) --- */}
            {!shouldShowFullContent && (
                <JoinGroup 
                    hasToken={hasToken}
                    joinRequestSent={joinRequestSent}
                    handleMembershipAction={handleMembershipAction} // Lähetä liittymistoiminto
                    banError={banError} // Näytä mahdollinen bännivirhe
                />
            )}

            {/* --- Täysi sisältö (Kun on jäsen) --- */}
            {shouldShowFullContent && (
                <>
                    {/* Ryhmän suosikkielokuvat (Paikkamerkki) */}
                    <section className="favourites">
                        <h2>Ryhmän suosikkielokuvat</h2>
                        <div className="favourite-list">
                            <p>Elokuvakortit näkyvät täällä...</p>
                        </div>
                    </section>

                    {/* Ryhmän jaetut näytökset */}
                    <section className="shared-shows my-4">
                        <h2>Jaetut näytökset</h2>
                        {groupShows.length > 0 ? (
                            <div className="row">
                            {groupShows.map((show) => (
                                <div key={show.shareid} className="col-md-6 d-flex">
                                <GroupShowCard
                                    key={show.shareid}
                                    show={show}
                                    userId={userId}
                                    ownerId={group.ownerid}
                                    onDelete={handleDeleteShow}
                                />
                                </div>
                            ))}
                            </div>
                        ) : (
                            <p>Ei jaettuja näytöksiä vielä.</p>
                        )}
                        </section>

                    <div className="middle-content">
                        {/* Foorumi (Paikkamerkki) */}
                        <section className="forum">
                            <h2>Foorumi</h2>
                            <div className="forum-messages">Foorumiviestit näkyvät täällä.</div>
                            <textarea placeholder="Kirjoita viesti"></textarea>
                            <button className="btn btn-primary w-100 mt-2">Lähetä</button>
                        </section>

                        {/* Jäsenluettelo ja hallinta */}
                        <GroupMembers
                            groupId={groupId}
                            ownerId={group.ownerid}
                            userId={userId}
                            isOwner={String(userId) === String(group.ownerid)}
                            isMember={isMember}
                            members={members}
                            setMembers={setMembers}
                            bannedMembers={bannedMembers}
                            setBannedMembers={setBannedMembers}
                            handleMembershipAction={handleMembershipAction} // Ryhmästä eroaminen
                            handleError={handleError}
                        />
                    </div>
                </>
            )}

            {/*Ryhmän muokkaus*/}
            {showEditModal && (
              <GroupEditModal
                onClose={() => setShowEditModal(false)}
                groupId={group.groupid}
                initialData={group}
                onUpdated={updatedGroup => setGroup(updatedGroup)}
              />
            )}
        </div>
    )
}