import Favourite from '../models/Favourite.js'
import { ApiError } from '../helper/ApiError.js'

// Lisää elokuva käyttäjän suosikkeihin
export const addFavourite = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { tmdbId } = req.body

    if (!tmdbId) {
      throw new ApiError('tmdbId puuttuu', 400)
    }

    await Favourite.add(userId, tmdbId)
    res.status(201).json({ message: 'Elokuva lisätty suosikkeihin' })
  } catch (error) {
    next(error)
  }
}

// Poistaa elokuvan käyttäjän suosikeista
export const removeFavourite = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { tmdbId } = req.params

    if (!tmdbId) {
      throw new ApiError('tmdbId puuttuu', 400)
    }

    await Favourite.remove(userId, tmdbId)
    res.status(200).json({ message: 'Elokuva poistettu suosikeista' })
  } catch (error) {
    next(error)
  }
}

// Hakee kaikki käyttäjän suosikit
export const getFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id

    const favourites = await Favourite.getByUser(userId)
    res.status(200).json(favourites)
  } catch (error) {
    next(error)
  }
}

// Hakee käyttäjän suosikkilistan julkisesti
export const getFavouriteList = async (req, res, next) => {
  try {
    const { userId } = req.params

    // Kutsutaan nyt uutta mallimetodia
    const favourites = await Favourite.getPublicList(userId)

    if (favourites.length === 0) {
      throw new ApiError('Käyttäjällä ei ole suosikkeja', 404)
    }

    res.status(200).json({
      username: favourites[0].username,
      favourites: favourites.map(r => ({ tmdbId: r.tmdbid }))
    })
  } catch (error) {
    next(error)
  }
}