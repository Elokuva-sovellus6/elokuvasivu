import GroupMovie from '../models/groupMovie.js'
import { ApiError } from '../helper/ApiError.js'

// Luo uuden jaon
export const createGroupMovie = async (req, res, next) => {
  try {
    const { groupID, tmdbID, movieName, image, url, reason } = req.body
    const userID = req.user.id

    if (!groupID || !tmdbID || !movieName) {
      throw new ApiError('Pakollisia tietoja puuttuu', 400)
    }

    const newShare = await GroupMovie.create({
      groupID,
      userID,
      tmdbID,
      movieName,
      image,
      url,
      reason
    })

    res.status(201).json(newShare)
  } catch (err) {
    next(err)
  }
}

// Hakee kaikki jaot ryhmästä
export const getGroupMovies = async (req, res, next) => {
  try {
    const { groupID } = req.params
    const shares = await GroupMovie.findByGroup(groupID)
    res.json(shares)
  } catch (err) {
    next(err)
  }
}

// Poistaa jaon
export const deleteGroupMovie = async (req, res, next) => {
  try {
    const { shareID } = req.params
    const userID = req.user.id

    // Hakee jaon tiedot ja ryhmän omistaja tietokannasta
    const shareInfo = await GroupMovie.findShareAndGroupOwner(shareID)

    if (!shareInfo) {
      throw new ApiError('Elokuvaa ei löydy', 404)
    }

    // Tarkistaa oikeudet (jakanut käyttäjä tai ryhmän omistaja)
    const { userid: sharerId, ownerid: groupOwnerId } = shareInfo
    
    if (sharerId !== userID && groupOwnerId !== userID) {
      throw new ApiError('Ei oikeutta poistaa tätä jakoa', 403)
    }

    // Poistaa jaon
    await GroupMovie.delete(shareID)
    
    res.json({ message: 'Elokuva poistettu onnistuneesti' })
  } catch (err) {
    next(err)
  }
}