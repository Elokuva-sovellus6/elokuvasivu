import React, { useEffect, useState } from "react"
import { getGroupMovies, deleteGroupMovie } from "../api/groupmovies.jsx"
import GroupMovieCard from "./GroupMovieCard.jsx"
import "./style/GroupMovieList.css"

export default function GroupMoviesList({ groupID, token, userId, ownerId }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(4)
  const [perRow, setPerRow] = useState(4)
  const [defaultVisible, setDefaultVisible] = useState(4)

  // Hakee elokuvat ryhmälle
  useEffect(() => {
    if (!groupID || !token) return
    (async () => {
      try {
        const data = await getGroupMovies(groupID, token)
        setMovies(data)
      } catch (err) {
        console.error("Virhe haettaessa jaettuja elokuvia:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [groupID, token])

  // Päivittää rivin korttien määrän ja näkyvien korttien määrän ikkunan koon mukaan
  const updatePerRow = () => {
    const width = window.innerWidth
    let newPerRow = 1
    let targetVisible = 4

    if (width >= 1200) {
      newPerRow = 4
      targetVisible = Math.min(4, movies.length) // Näyttä maksimissaan 4 oletuksena
    } else if (width >= 992) {
      newPerRow = 3
      targetVisible = Math.min(6, movies.length) // Näyttä kaksi riviä (3*2=6)
    } else if (width >= 700) {
      newPerRow = 2
      targetVisible = Math.min(4, movies.length) // Näyttä kaksi riviä (2*2=4)
    } else {
      newPerRow = 1
      targetVisible = Math.min(1, movies.length)
    }

    setPerRow(newPerRow)
    setDefaultVisible(targetVisible)

    // Päivittää visibleCountin ja varmistaa, ettei se ole pienempi kuin uusi 'defaultVisible'
    if (width < 1200) {
      setVisibleCount(prev => Math.max(prev, targetVisible))
    } else {
      // Isolla näytöllä palautetaan oletukseen
      setVisibleCount(targetVisible)
    }
  }

  // Lisää koonmuutoskuuntelijan ja kutsuu updatePerRow:ta
  useEffect(() => {
    updatePerRow()
    window.addEventListener("resize", updatePerRow)
    return () => window.removeEventListener("resize", updatePerRow)
  }, [movies])

  // Käsittelee jaetun elokuvan poistamisen
  const handleDeleteMovie = async (shareId) => {
    try {
      await deleteGroupMovie(shareId, token)
      setMovies(prev => prev.filter(m => m.shareid !== shareId))
    } catch (err) {
      console.error("Virhe poistettaessa elokuvaa:", err)
      alert("Elokuvan poistaminen epäonnistui")
    }
  }

  // Näytä lisää painikkeen toiminto
  const handleShowMore = () => {
    // Lisää näkyviin yhden rivin verran kortteja kerrallaan
    setVisibleCount(prev => Math.min(prev + perRow, movies.length))
  }

  // Näytä vähemmän painikkeen toiminto
  const handleShowLess = () => {
    // Palauttaa näkyviin defaultVisible-määrän
    setVisibleCount(defaultVisible)
  }

  if (loading) return <p>Ladataan jaettuja elokuvia...</p>
  if (movies.length === 0) return <p>Ryhmään ei ole vielä jaettu elokuvia.</p>

  return (
    <div>
      <div className="col-md-12 d-flex flex-wrap gap-3 group-movie-card-container">
        {/* Renderöi vain näkyvissä olevat kortit */}
        {movies.slice(0, visibleCount).map(m => (
          <GroupMovieCard
            key={m.shareid}
            movie={m}
            userId={userId}
            ownerId={ownerId}
            onDelete={handleDeleteMovie}
          />
        ))}
      </div>

      <div className="text-center mt-3">
        {/* Näytä "Näytä lisää" -nappi, jos elokuvia on vielä piilossa */}
        {visibleCount < movies.length ? (
          <button className="btn btn-sm" onClick={handleShowMore}>
            Näytä lisää
          </button>
        ) : 
        // Näytä "Näytä vähemmän" -nappi, jos elokuvia on enemmän kuin oletusnäkyvä
        movies.length > defaultVisible ? (
          <button className="btn btn-sm" onClick={handleShowLess}>
            Näytä vähemmän
          </button>
        ) : null}
      </div>
    </div>
  )
}