import React from 'react'

// Muotoilee bännin päättymisajan
const formatBanEndTime = (bannedUntil) => {
    // Käsittelee pysyvän bännin
    if (!bannedUntil) {
        return " (pysyvästi)" 
    }
    
    const endDate = new Date(bannedUntil)
    const now = new Date()
    
    const diffMs = endDate.getTime() - now.getTime()
    
    // Jos bännin päättymiseen on alle 0ms, sen pitäisi jo olla poistettu, mutta palautetaan silti tyhjä
    if (diffMs <= 0) {
        return ""
    }
    
    // Jos jäljellä yli 24 tuntia, näyttää tarkan päivämäärän ja ajan
    if (diffMs > 24 * 60 * 60 * 1000) {
        const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        return ` (esto päättyy: ${endDate.toLocaleDateString('fi-FI', dateOptions)})`
    } 
    
    // Jos alle 24 tuntia, näyttää jäljellä olevan ajan tunteina ja minuutteina
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    let timeString = " (jäljellä: "
    if (hours > 0) {
        timeString += `${hours} t `
    }
    timeString += `${minutes} min)`
    
    return timeString
}


export default function JoinGroup({
    hasToken, 
    joinRequestSent, 
    handleMembershipAction,
    banError
}) {
    let buttonText
    let buttonDisabled = false

    // Muodostaa bänniviestin ajankohtaisella päättymisajalla
    const banInfo = banError ? formatBanEndTime(banError.bannedUntil) : null
    // Koko bänniviesti yhdistettynä päättymisaikaan
    const fullBanMessage = banError ? banError.message + (banInfo || "") : null

    // Päättelee napin tilan ja tekstin
    if (banError) {
        buttonText = "Et voi liittyä tällä hetkellä"
        buttonDisabled = true
    } else if (!hasToken) {
        buttonText = "Kirjaudu liittyäksesi"
        buttonDisabled = true
    } else if (joinRequestSent) {
        buttonText = "Liittymispyyntö lähetetty"
        buttonDisabled = true
    } else {
        buttonText = "Lähetä liittymispyyntö"
    }

    // Käsittelee napin klikkauksen
    const handleJoinClick = () => {
        if (banError) {
            // Näyttää koko bänniviestin alertissa
            alert(fullBanMessage) 
        } else if (!hasToken) {
            alert('Kirjaudu sisään jatkaaksesi')
        } else if (!joinRequestSent) {
            // Suorittaa liittymispyynnön lähetystoiminnon
            handleMembershipAction() 
        } else {
            alert('Liittymispyyntö on jo lähetetty')
        }
    }

    return (
        <section className="join-prompt">
            <p className="join-message">
                **Liity ryhmään jakaaksesi suosikki elokuviasi ja keskustellaksesi muiden ryhmäläisten kanssa.**
            </p>
            {/* Näyttää bännivirheen jos sellainen on */}
            {fullBanMessage && (
                <p style={{ color: 'red', fontWeight: 'bold' }}>
                    {fullBanMessage}
                </p>
            )}
            
            <button
                className="btn btn-primary w-100 mt-2"
                onClick={handleJoinClick}
                disabled={buttonDisabled}
            >
                {buttonText}
            </button>
        </section>
    )
}