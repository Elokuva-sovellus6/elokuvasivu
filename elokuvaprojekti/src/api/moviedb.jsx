const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default BASE_URL;

// --- TMDB API-rajapintafunktiot (Backendin kautta) --- //

// Hakee TMDB-hakutulokset annetulla kyselyllä
export const searchMovies = async (query, page = 1) => {
    try {
        const response = await fetch(
            `${BASE_URL}/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`
        )
        if (!response.ok) {
            throw new Error(`Search error: ${response.status} ${response.statusText}`)
        }
        return await response.json()
    } catch (err) {
        console.error("Virhe searchMovies():", err)
        return { results: [], totalPages: 0 }
    }
}

// Hakee suositut elokuvat
export const getPopularMovies = async (page = 1) => {
    try {
        const response = await fetch(`${BASE_URL}/tmdb/popular?page=${page}`)
        if (!response.ok) {
            throw new Error(`Popular error: ${response.status} ${response.statusText}`)
        }
        return await response.json()
    } catch (err) {
        console.error("Virhe getPopularMovies():", err)
        return { results: [], totalPages: 0 }
    }
}

// Hakee elokuvan yksityiskohdat TMDB ID:llä
export const getMovieDetails = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/tmdb/${id}`)
        if (!response.ok) {
            throw new Error(`Details error: ${response.status} ${response.statusText}`)
        }
        return await response.json()
    } catch (err) {
        console.error("Virhe getMovieDetails():", err)
        return null
    }
}

// Hakee elokuvia genren ja/tai vuoden perusteella
export const discoverMovies = async ({ genre, year, page = 1 }) => {
    try {
        const params = new URLSearchParams()
        if (genre) params.append("genre", genre)
        if (year) params.append("year", year)
        params.append("page", page)

        const response = await fetch(`${BASE_URL}/tmdb/discover?${params}`)
        if (!response.ok) {
            throw new Error(`Discover error: ${response.status}`)
        }
        return await response.json()
    } catch (err) {
        console.error("Virhe discoverMovies():", err)
        return { results: [], totalPages: 1 }
    }
}

// Hakee saatavilla olevat genret
export const fetchGenres = async () => {
    try {
        const response = await fetch(`${BASE_URL}/tmdb/genres`)
        if (!response.ok) {
            throw new Error(`Genres fetch error: ${response.status}`)
        }
        const data = await response.json()
        return data.genres || []
    } catch (err) {
        console.error("Virhe fetchGenres():", err)
        return []
    }
}

// --- TMDB- ja Finnkino-tulosten yhdistämisfunktiot --- //

// Muuntaa HTML-entiteetit takaisin tekstiin
const decodeHtml = (html) => {
    const txt = document.createElement("textarea")
    txt.innerHTML = html
    return txt.value
}

// Poistaa Finnkinon nimistä näytösformaatit, kielikoodit ja muut merkinnät
const aggressiveClean = (name) => {
    let cleaned = name.replace(/ \((FIN|SWE)\)/gi, '')
    cleaned = cleaned.replace(/ ?- ?(Gaalaensi|Ensi|Spesiaali)[\s-]*näytös/gi, '')
    cleaned = cleaned.replace(/ ?- ?(Gaala|Ensi|Premium)[\s-]*ilta/gi, '')
    cleaned = cleaned.replace(/\b(gaalaensi-ilta|gaalaensiilta|ensi-ilta)\b/gi, '')
    cleaned = cleaned.replace(/\s(3D|4K|2D)\s*$/gi, '')
    cleaned = cleaned.replace(/ \/ .*/, '')
    cleaned = cleaned.replace(/\s?\((dub|remaster|uusintajulkaisu|uudelleenjulkaisu|anniversary)\)/gi, '')

    // Käsittelee '&'-merkin korvaamalla sen ' and '-sanoilla
    cleaned = cleaned.replace(/&/g, ' and ') 

    return cleaned.trim().replace(/\s+/g, ' ') // Poistaa ylimääräiset välilyönnit
}

// Laskee Levenshtein-samankaltaisuuden (0–1) kahden merkkijonon välillä
const levenshteinSimilarity = (a, b) => {
    if (!a || !b) return 0
    const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
        Array(a.length + 1).fill(0)
    )

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            if (a[i - 1] === b[j - 1]) {
                matrix[j][i] = matrix[j - 1][i - 1]
            } else {
                matrix[j][i] = Math.min(
                    matrix[j - 1][i - 1] + 1,
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1
                )
            }
        }
    }

    const distance = matrix[b.length][a.length]
    const maxLen = Math.max(a.length, b.length)
    return 1 - distance / maxLen
}

// Pisteyttää kahden nimen vastaavuuden sanamatchien ja Levenshtein-samankaltaisuuden perusteella
const scoreMatch = (tmdbTitle, searchName) => {
    if (!tmdbTitle || !searchName) return 0.0

    if (tmdbTitle.toLowerCase() === searchName.toLowerCase()) return 1.0

    // Erotellaan sanat, joiden pituus on yli 2 merkkiä
    const tmdbWords = tmdbTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const searchWords = searchName.toLowerCase().split(/\s+/).filter(w => w.length > 2)

    if (searchWords.length === 0) return 0

    // Lasketaan osumat sanoista, jotka löytyvät molemmista nimistä
    const matches = searchWords.filter(word =>
        tmdbWords.some(w => w.includes(word) || word.includes(w))
    )

    let score = matches.length / searchWords.length

    // Levenshtein-fall back: nostaa pisteytystä, jos sanamatch on heikko (alle 0.6)
    if (score < 0.6) {
        const lev = levenshteinSimilarity(tmdbTitle.toLowerCase(), searchName.toLowerCase())
        // Käytetään kerrointa 1.1 antamaan Levenshteinille vahva paino
        score = Math.max(score, lev * 1.1) 
    }

    return score
}

// Tarkistaa, onko TMDB-nimi epäilyttävä tapahtuma/uusintajulkaisu
const isSuspiciousEvent = (tmdbTitle) => {
    const lower = tmdbTitle.toLowerCase()
    return lower.includes('live') || lower.includes('premiere') || lower.includes('screening') ||
             lower.includes('event') || lower.includes('tour') || lower.includes('remastered') || 
             lower.includes('anniversary')
}

// Hakee TMDB-tulokset backendistä
const fetchTMDBData = async (query) => {
    try {
        const response = await fetch(`${BASE_URL}/tmdb/search?query=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error(`TMDB backend fetch error: ${response.status}`)
        const data = await response.json()
        return data.results || []
    } catch (err) {
        console.error("Virhe fetchTMDBData():", err)
        return []
    }
}

// Hakee TMDB-tuloksia Finnkinon elokuvalle eri nimivariaatioilla
const getTmdbResultsForFinnkinoMovie = async (f) => {
    const rawName = decodeHtml(f.name)
    const cleanedName = aggressiveClean(rawName)
    const queries = [rawName]

    // Lisätään puhdistettu nimi kyselyihin
    if (cleanedName && cleanedName !== rawName) queries.push(cleanedName)

    // Jos nimessä on alaotsikko, testataan myös ilman
    if (rawName.includes(':')) queries.push(rawName.split(':')[0].trim())
    if (cleanedName.includes(':')) queries.push(cleanedName.split(':')[0].trim())

    // Lisätään Finnkinon alkuperäinen nimi (f.originalTitle)
    if (f.originalTitle) queries.push(f.originalTitle)

    // Lähetetään kyselyt TMDB:hen järjestyksessä
    for (const q of queries) {
        const results = await fetchTMDBData(q)
        // Palautetaan heti ensimmäinen tulosjoukko, jos tuloksia löytyy
        if (results.length > 0) return results
    }

    return []
}

// --- Pääfunktio: Yhdistää Finnkinon elokuvat TMDB-tietoihin --- //

export const matchFinnkinoWithTMDB = async (finnkinoMovies) => {
    const matches = []

    // Käydään läpi jokainen Finnkinon elokuva
    for (const f of finnkinoMovies) {
        const year = f.year || ''
        const tmdbResults = await getTmdbResultsForFinnkinoMovie(f)

        let bestScore = -1
        let bestTMDB = null
        let finalMatchYear = null

        // Pisteytetään jokainen TMDB-hakutulos
        tmdbResults.forEach(r => {
            let score = 0
            const tmdbTitleLower = r.title.toLowerCase()
            const tmdbOriginalLower = r.original_title.toLowerCase()
            const searchNameLower = aggressiveClean(decodeHtml(f.name)).toLowerCase()
            const tmdbYear = r.release_date?.slice(0,4)

            // Lasketaan nimi-osuman pisteet käyttäen eri TMDB-nimien parasta matchiä
            const nameScore = Math.max(
                scoreMatch(tmdbTitleLower, searchNameLower),
                scoreMatch(tmdbOriginalLower, searchNameLower),
                scoreMatch(searchNameLower, tmdbTitleLower),
                scoreMatch(searchNameLower, tmdbOriginalLower)
            )
            score += nameScore

            // BONUKSET ALKUPERÄISESTÄ NIMESTÄ
            // Täydellinen alkuperäisen nimen osuma antaa erittäin suuren bonuksen
            if (r.original_title && r.original_title.toLowerCase() === f.originalTitle?.toLowerCase()) {
                score += 10.0 
            } 
            // Osittainen alkuperäisen nimen osuma antaa myös suuren bonuksen
            else if (f.originalTitle && 
                (r.original_title.toLowerCase().includes(f.originalTitle.toLowerCase()) ||
                f.originalTitle.toLowerCase().includes(r.original_title.toLowerCase()))
                ) {
                score += 8.0 
            }
            
            // VUOSILUVUN PISTEYTYS
            if (year && tmdbYear) {
                // Täydellinen vuosiluku-osuma antaa bonusta
                if (tmdbYear === String(year)) score += 2.0
                else {
                    const yearDiff = Math.abs(parseInt(year) - parseInt(tmdbYear))
                    // Pieni bonus, jos osumat ovat hyvät ja vuodet lähellä
                    if (nameScore >= 0.8 && yearDiff <= 2) score += 0.2
                    // Suuri rangaistus, jos vuodet ovat kaukana toisistaan (2+ vuotta)
                    if (yearDiff >= 2) score -= yearDiff * 1.5 
                }
            }

            // RANGAISTUS EPÄILYTTÄVISTÄ EVENTEISTÄ
            // Vähennetään pisteitä, jos TMDB-tuloksessa on event-tyyppisiä sanoja
            if (isSuspiciousEvent(r.title)) score -= 2.0 

            // GENRE-OSUMAN PISTEYTYS
            // Pieni bonus genre-osumatilanteissa
            if (f.genres && r.genre_ids && f.genres.length > 0) {
                const overlap = r.genre_ids.filter(id => f.genres.includes(id))
                if (overlap.length > 0) score += 0.3
            }

            // KUVAUSTEN OSITTAISEN ONSUMAN PISTEYTYS
            // Pieni bonus kuvausten sanamatch-osumissa
            if (f.description && r.overview) {
                const descWords = f.description.toLowerCase().split(/\W+/).filter(w => w.length > 4)
                const overviewWords = r.overview.toLowerCase().split(/\W+/).filter(w => w.length > 4)
                const common = descWords.filter(w => overviewWords.includes(w))
                if (common.length > 0) score += Math.min(0.5, common.length * 0.05)
            }

            // Päivitetään paras osuma
            if (score > bestScore || (score === bestScore && r.release_date > finalMatchYear)) {
                bestScore = score
                bestTMDB = r
                finalMatchYear = r.release_date
            }
        })

        // Lisätään match, jos pisteet ylittää kynnyksen (1.0)
        if (bestTMDB && bestScore >= 1.0) {
            matches.push({ finnkino: f, tmdb: bestTMDB, score: bestScore })
        }
    }

    return matches
}