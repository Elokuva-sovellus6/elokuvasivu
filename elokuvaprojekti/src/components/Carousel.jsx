import React, { useRef } from "react"
import "./style/Carousel.css"

// Vaakasuuntainen vieritysnäkymän, jossa on dynaamisesti 
// näkyviin tuleva/katoava scrollbar ja selausnuolet

export default function Carousel({ children }) {
    const scrollRef = useRef(null)
    const timeoutRef = useRef(null)

    
    // Näyttää scrollbarin hetkellisesti ja asettaa ajastimen sen piilottamiseksi
    // Nollaa aiemman ajastimen, jos uusi vieritys/nappipainallus tapahtuu

    const showScrollbarTemporarily = () => {
        const container = scrollRef.current
        if (!container) return

        // Asetetaan luokka, joka tekee scrollbarin näkyväksi
        container.classList.add("show-scrollbar")

        // Nollataan mahdollinen aiempi timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        // Piilotetaan scrollbar 3s vierityksen/napin painalluksen jälkeen
        timeoutRef.current = setTimeout(() => {
            container.classList.remove("show-scrollbar")
            timeoutRef.current = null
        }, 3000)
    }

    // Käsittelee nuolinapin painalluksen ja vierittää sisältöä.
    const scroll = (direction) => {
        const container = scrollRef.current
        if (!container) return

        // Vieritysmatka on 80% containerin leveydestä
        const scrollAmount = container.clientWidth * 0.8
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        })

        // Näytetään scrollbar selaustoiminnon ajaksi
        showScrollbarTemporarily()
    }



    // Näytetään scrollbar, kun sisältöä vieritetään
    const handleScroll = () => {
        showScrollbarTemporarily()
    }

    return (
        <div className="scrollview-wrapper">
            {/* Vasen nuoli */}
            <button
                className="scroll-arrow scroll-arrow-left"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
            >
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 1 4 8l7 7" stroke="#4f46e5" strokeWidth="2" fill="none" />
                </svg>
            </button>

            <div 
                className="scrollview-container d-flex overflow-auto" 
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {children}
            </div>

            {/* Oikea nuoli */}
            <button
                className="scroll-arrow scroll-arrow-right"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
            >
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 1l7 7-7 7" stroke="#4f46e5" strokeWidth="2" fill="none" />
                </svg>
            </button>
        </div>
    )
}