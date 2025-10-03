// Päivämäärän muotoilu
export function formatDateForAPI(dateStr) {
  const [year, month, day] = dateStr.split("-")
  return `${day}.${month}.${year}`
}

//Teatterit
export async function getTheatreAreas() {
  const response = await fetch("https://www.finnkino.fi/xml/TheatreAreas/")
  const xml = await response.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml, "application/xml")
  const areaElements = xmlDoc.getElementsByTagName("TheatreArea")
  const tempAreas = []

  //Käy läpi teatterit, hakee ID:n ja nimen
  for (let i = 0; i < areaElements.length; i++) {
    tempAreas.push({
      id: areaElements[i].getElementsByTagName("ID")[0].textContent,
      name: areaElements[i].getElementsByTagName("Name")[0].textContent,
    })
  }

  return tempAreas
}

// Näytösten haku
export async function getShows(areaId, dateForAPI) {
  const response = await fetch(
    `https://www.finnkino.fi/xml/Schedule/?area=${areaId}&dt=${dateForAPI}`
  )
  const xml = await response.text()
  return getFinnkinoShows(xml)
}

// XML parsinta näytöksille
function getFinnkinoShows(xml) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml, "application/xml")
  const shows = xmlDoc.getElementsByTagName("Show")
  const tempMovieShows = []
  const movieMap = new Map()

  //Käy läpi kaikki näytökset, hakee seuraavat tiedot:
  for (let i = 0; i < shows.length; i++) {
    const show = shows[i]
    const rawName = show.getElementsByTagName("Title")[0]?.textContent

    const movieObj = {
      id: show.getElementsByTagName("ID")[0]?.textContent, //Näytöksen ID
      time: show.getElementsByTagName("dttmShowStart")[0]?.textContent, //Näytös ajankohta
      eventId: show.getElementsByTagName("EventID")[0]?.textContent,
      name: rawName ? rawName.trim() : null, //Elokuvan nimi
      year: show.getElementsByTagName("ProductionYear")[0]?.textContent, //Julkaisuvuosi
      length: show.getElementsByTagName("LengthInMinutes")[0]?.textContent, //Elokuvan pituus min
      genre: show.getElementsByTagName("Genres")[0]?.textContent, //Genre
      theatre: show.getElementsByTagName("Theatre")[0]?.textContent, //Näytöspaikka
      auditorium: show.getElementsByTagName("TheatreAuditorium")[0]?.textContent, //sali
      image: show.getElementsByTagName("EventLargeImagePortrait")[0]?.textContent, //Kuva
      url: show.getElementsByTagName("ShowURL")[0]?.textContent //Linkki haluttuun näytökseen

    }
    tempMovieShows.push(movieObj)

    if (!movieMap.has(movieObj.eventId)) {
      movieMap.set(movieObj.eventId, movieObj);
    }
  }

  //Elokuvat aakkosjärjestykseen
  const sortedUniqueMovies = Array.from(movieMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return { movieShows: tempMovieShows, uniqueMovies: sortedUniqueMovies }
}
