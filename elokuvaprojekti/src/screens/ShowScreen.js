import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
//import { searchMovieInTMDB } from "../api/moviedb.js"
import GenericDropdown from "../components/Dropdown.js"


export default function Naytokset() {
    const [movieShows, setMovieShows] = useState([])        //Kaikki näytökset, voi olla sama elokuva moneen kertaan    
    const [uniqueMovies, setUniqueMovies] = useState([])    //Elokuva on listassa vain kerran
    const [areas, setAreas] = useState([])                  //Alueet
    const [selectedArea, setSelectedArea] = useState("1014") //Valittu alue, oletusalue Pk-seutu
    const [selectedDate, setSelectedDate] = useState(getTodayDate())    //Valittu päivämäärä

    function getTodayDate() {
        const today = new Date()
        return today.toISOString().split("T")[0]
    }

    function formatDateForAPI(dateStr) {
        const [year, month, day] = dateStr.split("-")
        return `${day}.${month}.${year}`
    }
    //Teatterit
    const getTheatreAreas = async () => {
        const response = await fetch('https://www.finnkino.fi/xml/TheatreAreas/')
        const xml = await response.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xml, 'application/xml')
        const areaElements = xmlDoc.getElementsByTagName("TheatreArea")
        const tempAreas = []

        //Käy läpi teatterit, hakee ID:n ja nimen
        for (let i = 0; i < areaElements.length; i++) {
            tempAreas.push({
                id: areaElements[i].getElementsByTagName("ID")[0].textContent,
                name: areaElements[i].getElementsByTagName("Name")[0].textContent
            })
        }
        setAreas(tempAreas)
    }

    //Näytökset
    const getFinnkinoShows = (xml) => {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xml,'application/xml')
        const root = xmlDoc.children
        const shows = root[0].children
        const show = shows[1].children
        const tempMovieShows = []
        const movieMap = new Map()
        console.log(show)
        //Käy läpi kaikki näytökset, hakee seuraavat tiedot:
        for (let i=0;i<show.length;i++) {   
                const movieObj = {
                    "id": show[i].children[0].innerHTML,        //Näytöksen ID
                    "time": show[i].children[2].innerHTML,      //Näytös ajankohta
                    "name": show[i].children[15].innerHTML,     //Elokuvan nimi
                    "year": show[i].children[17].innerHTML,     //Julkaisuvuosi
                    "length": show[i].children[18].innerHTML,   //Elokuvan pituus min
                    "genre": show[i].children[24].innerHTML,    //Genre
                    "theatre": show[i].children[29].innerHTML,  //Näytöspaikka
                    "image": show[i].getElementsByTagName("EventLargeImagePortrait")[0]?.textContent   //kkuva
                }
                tempMovieShows.push(movieObj)

                if (!movieMap.has(movieObj.name)) {
                    movieMap.set(movieObj.name, movieObj)
                }
            }
        //Elokuvat aakkosjärjestykseen
        const sortedUniqueMovies = Array.from(movieMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        )
        setMovieShows(tempMovieShows)
        setUniqueMovies(sortedUniqueMovies)
    }

    useEffect(() => {
        getTheatreAreas()
    }, [])
    //Alueiden haku ja alueen elokuvat
    useEffect(() => {
            const dateForAPI = formatDateForAPI(selectedDate)
            fetch(`https://www.finnkino.fi/xml/Schedule/?area=${selectedArea}&dt=${dateForAPI}`)
            .then(response => response.text())
            .then(xml => getFinnkinoShows(xml))
            .catch(error => console.log(error))
    }, [selectedArea, selectedDate])

   /* useEffect(() => {
      const fetchTMDBIds = async () => {
        const updatedMovies = await Promise.all(uniqueMovies.map(async (movie) => {
          try {
            const tmdbId = await searchMovieInTMDB(movie.name, movie.year)
            return { ...movie, tmdbId }
          } catch (err) {
            console.error("Virhe TMDB-haussa:", err)
            return { ...movie, tmdbId: null }
          }
        }))
        setUniqueMovies(updatedMovies)
      }
  
      if (uniqueMovies.length > 0) {
        fetchTMDBIds()
      }
    }, [uniqueMovies])*/


    return (
        <div>
            <h3>Finnkino näytökset</h3>
            {/* Teatterialueen valinta */}
            <GenericDropdown
              label="Valitse alue"
              items={areas}
              selected={selectedArea}
              onSelect={setSelectedArea}
              itemKey="id"
              itemLabel="name"
            />
            {/*Päivämäärän valinta*/}
            <label style={{ marginLeft: '1rem' }}>Valitse päivämäärä: </label>
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            />
            {/*Bootstrap listaa elokuvat kortteina*/}
            <div className="container mt-4">
              <div className="row">
                {uniqueMovies.map((movie) => {
                  const showtimes = movieShows.filter(show => show.name === movie.name)

                  const CardContent = (
                    <>
                      <img
                        src={movie.image}
                        className="card-img-top"
                        alt={movie.name}
                        style={{ height: "600px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title"><strong>{movie.name}</strong></h5>
                        <p className="card-text">
                          <strong>Genre:</strong> {movie.genre}
                        </p>
                        <p className="card-text"><strong>Näytökset:</strong></p>
                        <ul className="mb-0">
                          {showtimes.map((show, idx) => (
                            <li key={idx}>
                              {new Date(show.time).toLocaleTimeString('fi-FI', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} ({show.theatre})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )

                  return (
                    <div className="col-md-6 col-lg-4 mb-4" key={movie.id}>
                      {movie.tmdbId ? (
                        <Link to={`/movie/${movie.tmdbId}`} style={{ textDecoration: "none", color: "inherit" }}>
                          <div className="card h-100 shadow-sm">{CardContent}</div>
                        </Link>
                      ) : (
                        <div className="card h-100 shadow-sm">{CardContent}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

        </div>
    )
}