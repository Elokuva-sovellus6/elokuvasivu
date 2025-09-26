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
    return cleaned.trim()
}

// Lista yleisistä sanoista joita ei huomioida pisteytyksessä
const commonWords = ['the', 'a', 'an', 'of', 'in', 'and', 'for', 'with', 'to', 'is', 'it', 'was']

// Laskee nimen vastaavuuspisteet (0.0–1.0)
// 1.0 = täydellinen match, 0.0 = ei yhtään osumaa
const scoreMatch = (tmdbTitle, searchName) => {
    if (tmdbTitle.toLowerCase() === searchName.toLowerCase()) return 1.0

    const tmdbWords = tmdbTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !commonWords.includes(w))
    const searchWords = searchName.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !commonWords.includes(w))

    if (searchWords.length === 0) return 0

    const matches = searchWords.filter(word => tmdbWords.includes(word))
    return matches.length / searchWords.length
}

// Tarkistaa sisältääkö nimi epäilyttäviä sanoja
// Esim. "live", "event", "tour" → voi viitata placeholderiin eikä oikeaan elokuvaan
const isSuspiciousEvent = (tmdbTitle) => {
    const lower = tmdbTitle.toLowerCase()
    return lower.includes('live') || lower.includes('premiere') || lower.includes('screening') || lower.includes('event') || lower.includes('tour') || lower.includes('remastered')
}

// Hakee elokuvan TMDB:stä nimen perusteella
// Palauttaa TMDB-elokuvan id:n tai null jos sopivaa ei löydy
export const searchMovieInTMDB = async (movieName, releaseYear = '', OriginalTitle = '', ProductionYear = '') => {
    if (!API_KEY) {
        console.error("tmdb api key puuttuu!")
        return null
    }

    const rawName = decodeHtml(movieName)
    const cleanedName = aggressiveClean(rawName)
    const cleanedOriginal = aggressiveClean(decodeHtml(OriginalTitle))
    const year = releaseYear || ProductionYear || ''
    const yearQuery = ''

    // Yritä hakea ensin OriginalTitlella (Finnkinon tarjoama alkuperäisnimi)
    if (cleanedOriginal) {
        try {
            const urlOriginal = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(cleanedOriginal)}&language=en-US`
            const response = await fetch(urlOriginal)
            const data = await response.json()

            if (data.results && data.results.length > 0) {
                const exactMatch = data.results.find(r =>
                    r.original_title.toLowerCase() === cleanedOriginal.toLowerCase() &&
                    !isSuspiciousEvent(r.title)
                )
                if (exactMatch) return exactMatch.id
            }
        } catch (err) {
            console.error(`Virhe TMDB-haussa OriginalTitlella "${cleanedOriginal}":`, err)
        }
    }

    // Tee haku puhdistetulla nimellä suomeksi ja englanniksi
    const urls = [
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(cleanedName)}&language=fi-FI`,
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(cleanedName)}&language=en-US`
    ]

    let bestScore = -1
    let finalMatchId = null

    for (const url of urls) {
        try {
            const response = await fetch(url)
            const data = await response.json()

            if (data.results && data.results.length > 0) {
                // Jos löytyy oikean vuoden elokuvia, käytä vain niitä
                let candidates = data.results
                if (year) {
                    const yearFiltered = data.results.filter(r => r.release_date?.slice(0,4) === String(year))
                    if (yearFiltered.length > 0) candidates = yearFiltered
                }

                // Laske pisteet jokaiselle ehdokkaalle
                candidates.forEach(r => {
                    let score = 0
                    const tmdbTitleLower = r.title.toLowerCase()
                    const tmdbOriginalLower = r.original_title.toLowerCase()
                    const searchNameLower = cleanedName.toLowerCase()

                    // Match pisteytetään sekä suomenkielisen että alkuperäisen nimen mukaan
                    score = Math.max(scoreMatch(tmdbTitleLower, searchNameLower), scoreMatch(tmdbOriginalLower, searchNameLower))

                    // Vuosibonus: jos julkaisuvuosi osuu kohdalleen → +2.0
                    if (year && r.release_date?.slice(0,4) === String(year)) {
                        score += 2.0
                    }

                    // Epäilyttävistä sanoista pieni miinus → -0.5
                    if (isSuspiciousEvent(r.title)) score -= 0.5

                    if (score > bestScore) {
                        bestScore = score
                        finalMatchId = r.id
                    }
                })
            }
        } catch (err) {
            console.error(`Virhe TMDB-haussa nimelle "${cleanedName}":`, err)
        }
    }

    // Hyväksy vain jos pisteet riittää
    // 2.0+ = varma osuma, 0.9+ = kelvollinen osuma
    if (finalMatchId && bestScore >= 2.0) return finalMatchId
    if (finalMatchId && bestScore >= 0.8) return finalMatchId

    return null
}






