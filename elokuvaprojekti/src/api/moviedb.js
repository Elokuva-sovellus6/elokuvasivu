const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

// Haetaan elokuvat TMDB:stä hakusanalla ja sivulla
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&include_adult=false&language=en-US&page=${page}`
    )

    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      results: data.results || [],
      totalPages: data.total_pages || 0
    }
  } catch (err) {
    console.error("Virhe haussa:", err)
    return { results: [], totalPages: 0 }
  }
}

// Käytetään tätä defaultin hakuna, jos hakukenttä on tyhjä
export const getPopularMovies = async (page = 1) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  const data = await response.json()
  return {
    results: data.results,
    totalPages: data.total_pages
  }
}

export const getMovieDetails = async (id) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
    )

    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (err) {
    console.error("Virhe elokuvan haussa:", err)
    return null
  }
}

// Funktioita TMDB:n ja Finnkinon hakutulosten yhdistämiseen
// Näitä tarvitaan että saadaan linkit näytöksistä elokuvasivuille

// Apufunktioita suodatukseen
const decodeHtml = (html) => {
    const txt = document.createElement("textarea")
    txt.innerHTML = html
    return txt.value
}

// Poistaa Finnkinon nimistä turhia merkintöjä (kielikoodit, gaalat, ensi-illat, formaatit)
const aggressiveClean = (name) => {
    let cleaned = name.replace(/ \((FIN|SWE)\)/gi, '')
    cleaned = cleaned.replace(/ ?- ?(Gaalaensi|Ensi|Spesiaali)[\s-]*näytös/gi, '')
    cleaned = cleaned.replace(/ ?- ?(Gaala|Ensi|Premium)[\s-]*ilta/gi, '')
    cleaned = cleaned.replace(/\b(gaalaensi-ilta|gaalaensiilta|ensi-ilta)\b/gi, '')
    cleaned = cleaned.replace(/\s(3D|4K|2D)\s*$/gi, '')
    cleaned = cleaned.replace(/ \/ .*/, '')
    cleaned = cleaned.replace(/:.*/, '')
    cleaned = cleaned.replace(/\s?\((dub|remaster|uusintajulkaisu|uudelleenjulkaisu|anniversary)\)/gi, '')

    return cleaned.trim()
}

// Laskee nimen vastaavuuspisteet (0.0–1.0)
// 1.0 = täydellinen match, 0.0 = ei yhtään osumaa
const scoreMatch = (tmdbTitle, searchName) => {
    if (!tmdbTitle || !searchName) return 0.0
    
    // Täydellinen osuma nimestä
    if (tmdbTitle.toLowerCase() === searchName.toLowerCase()) return 1.0

    const tmdbWords = tmdbTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const searchWords = searchName.toLowerCase().split(/\s+/).filter(w => w.length > 2)

    if (searchWords.length === 0) return 0

    // Lasketaan myös osittaiset osumat
    const matches = searchWords.filter(word =>
        tmdbWords.some(w => w.includes(word) || word.includes(w))
    )

    // Osittaisen osuman pisteytys: kuinka monta hakusanaa löytyi
    return matches.length / searchWords.length
}

// Tarkistaa sisältääkö nimi epäilyttäviä sanoja
// Esim. "live", "event", "tour" voi viitata placeholderiin
const isSuspiciousEvent = (tmdbTitle) => {
    const lower = tmdbTitle.toLowerCase()
    return lower.includes('live') || lower.includes('premiere') || lower.includes('screening') || lower.includes('event') || lower.includes('tour') || lower.includes('remastered') || lower.includes('anniversary')
}

// Hakee elokuvan TMDB:stä nimen perusteella
// Palauttaa TMDB-elokuvan id:n tai null jos sopivaa ei löydy
export const searchMovieInTMDB = async (movieName, releaseYear = '', OriginalTitle = '', ProductionYear = '', movieGenres = [], movieDescription = '') => {
    if (!API_KEY) {
        console.error("tmdb api key puuttuu!")
        return null
    }

    const rawName = decodeHtml(movieName)
    const cleanedName = aggressiveClean(rawName)
    const cleanedOriginal = aggressiveClean(decodeHtml(OriginalTitle))
    const year = releaseYear || ProductionYear || ''

    // Uudelleenjulkaisun tunnistus
    const isReRelease = (decodeHtml(OriginalTitle).toLowerCase().includes('uudelleenjulkaisu') || rawName.toLowerCase().includes('uudelleenjulkaisu'))

    // Tarkistetaan sekä alkuperäinen että siistitty versio OriginalTitlesta
    const originalVariants = [cleanedOriginal, decodeHtml(OriginalTitle)]

    for (const variant of originalVariants) {
        if (!variant) continue
        try {
            // Tehdään haku puhtaalla OriginalTitlella
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(variant)}&language=en-US`
            const response = await fetch(url)
            const data = await response.json()

            if (data.results && data.results.length > 0) {
                // Etsitään täydellista matchia alkuperäisestä nimestä
                const exactMatch = data.results.find(r =>
                    !isSuspiciousEvent(r.title) &&
                    (r.original_title.toLowerCase() === variant.toLowerCase() ||
                     r.title.toLowerCase() === variant.toLowerCase())
                )
                // Jos täydellinen match löytyy, palautetaan heti
                if (exactMatch) return exactMatch.id
            }
        } catch (err) {
            console.error(`Virhe tmdb haussa OriginalTitlella "${variant}":`, err)
        }
    }

    // Kerätään kaikki haettavat nimet (puhdistettu suomi, puhdistettu alkuperäinen)
    const searchNames = new Set()
    searchNames.add(cleanedName)
    if (cleanedOriginal && cleanedOriginal !== cleanedName) {
        searchNames.add(cleanedOriginal)
    }

    // Luodaan haku URL:t jokaiselle nimelle
    const urls = []
    for (const name of searchNames) {
        urls.push(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(name)}&language=fi-FI`)
        urls.push(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(name)}&language=en-US`)
    }

    let bestScore = -1
    let finalMatchId = null
    let finalMatchYear = null

    for (const url of urls) {
        try {
            const response = await fetch(url)
            const data = await response.json()

            if (data.results && data.results.length > 0) {
                let candidates = data.results

                // Jos vuosi tiedossa ja kyseessä ei ole uudelleenjulkaisu, otetaan vain sen vuoden elokuvat
                if (year && !isReRelease) {
                    const yearFiltered = data.results.filter(r => r.release_date?.slice(0,4) === String(year))
                    // Käytetään suodatettuja ehdokkaita vain jos niitä löytyy
                    if (yearFiltered.length > 0) {
                        candidates = yearFiltered
                    }
                }
                
                // Lasketaan pisteet jokaiselle hakutulokselle
                candidates.forEach(r => {
                    let score = 0
                    const tmdbTitleLower = r.title.toLowerCase()
                    const tmdbOriginalLower = r.original_title.toLowerCase()
                    const searchNameLower = cleanedName.toLowerCase()
                    const tmdbYear = r.release_date?.slice(0,4)
                    
                    // Match pisteytetään sekä suomenkielisen että alkuperäisen nimen mukaan
                    const nameScore = Math.max(
                        scoreMatch(tmdbTitleLower, searchNameLower),
                        scoreMatch(tmdbOriginalLower, searchNameLower),
                        scoreMatch(searchNameLower, tmdbTitleLower),
                        scoreMatch(searchNameLower, tmdbOriginalLower)
                    )
                    score += nameScore

                    // Jos OriginalTitle matchaa täydellisesti +3.0
                    if (cleanedOriginal && tmdbOriginalLower === cleanedOriginal.toLowerCase()) {
                        score += 3.0
                    }
                    // Jos OriginalTitle sisältää edes osan toisesta +2.5
                    else if (cleanedOriginal && nameScore >= 0.8 && (tmdbOriginalLower.includes(cleanedOriginal.toLowerCase()) || cleanedOriginal.toLowerCase().includes(tmdbOriginalLower))) {
                        score += 2.5
                    }

                    // Vuosi boost/rankaisu
                    if (year && tmdbYear) {
                        if (tmdbYear === String(year)) {
                            score += 2.0 // Täydellinen vuosi +2.0
                        } else {
                            const yearDiff = Math.abs(parseInt(year) - parseInt(tmdbYear))
                            
                            // Jos nimiosuma on hyvä ja kyseessä on vain 1-2 vuoden ero, annetaan +0.2
                            if (nameScore >= 0.8 && yearDiff <= 2) {
                                score += 0.2
                            }
                            
                            // Jos ero on suuri ja kyseessä ei ole uudelleenjulkaisu, rankaistaan vähentämällä puolet pisteistä
                            if (!isReRelease && yearDiff >= 2) {
                                score -= yearDiff * 0.5
                            }
                        }
                    }

                    // Epäilyttävistä sanoista pieni miinus -0.5
                    if (isSuspiciousEvent(r.title)) score -= 0.5

                    // Genre boost +0.3
                    if (movieGenres && r.genre_ids && movieGenres.length > 0) {
                        const overlap = r.genre_ids.filter(id => movieGenres.includes(id))
                        if (overlap.length > 0) score += 0.3
                    }

                    // Kuvaus boost
                    if (movieDescription && r.overview) {
                        const descWords = movieDescription.toLowerCase().split(/\W+/).filter(w => w.length > 4)
                        const overviewWords = r.overview.toLowerCase().split(/\W+/).filter(w => w.length > 4)
                        const common = descWords.filter(w => overviewWords.includes(w))
                        if (common.length > 0) score += Math.min(0.5, common.length * 0.05)
                    }

                    // Jos pisteet paremmat, tai tasapeli mutta tämä on uudempi julkaisu
                    if (
                        score > bestScore ||
                        (score === bestScore && r.release_date > finalMatchYear)
                    ) {
                        bestScore = score
                        finalMatchId = r.id
                        finalMatchYear = r.release_date
                    }
                })
            }
        } catch (err) {
            console.error(`Virhe tmdb haussa nimelle "${cleanedName}":`, err)
        }
    }

    // Hyväksy vain jos pisteet riittää >= 1.0
    // Tarkat OriginalTitle-matchit saavat >= 3.0 pisteet
    // Nimi + Vuosi matchit saavat >= 2.0 pisteet
    if (finalMatchId && bestScore >= 3.0) return finalMatchId
    if (finalMatchId && bestScore >= 2.0) return finalMatchId
    if (finalMatchId && bestScore >= 1.0) return finalMatchId

    return null
}