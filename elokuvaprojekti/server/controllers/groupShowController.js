import GroupShow from '../models/GroupShow.js';
import { ApiError } from '../helper/ApiError.js';

// Luo uuden jaon
export const createGroupShow = async (req, res, next) => {
  try {
    const { groupID, showID, eventID, tmdbID, theatre, auditorium, showTime, reason, image, url, movieName } = req.body
    const userID = req.user.id

    if (!groupID || !showID || !eventID || !theatre || !showTime) {
      throw new ApiError('Pakollisia tietoja puuttuu', 400)
    }

    const newShare = await GroupShow.create({
      groupID,
      userID,
      showID,
      eventID,
      tmdbID,
      theatre,
      auditorium,
      showTime,
      reason,
      image,
      url,
      movieName
    })

    res.status(201).json(newShare)
  } catch (err) {
    next(err)
  }
}

// Hakee kaikki jaot ryhmästä
export const getGroupShows = async (req, res, next) => {
  try {
    const { groupID } = req.params
    const shares = await GroupShow.findByGroup(groupID)
    res.json(shares)
  } catch (err) {
    next(err)
  }
}

// Poistaa jaon
export const deleteGroupShow = async (req, res, next) => {
  try {
    const { shareID } = req.params
    const userID = req.user.id

    // Tarkistetaan oikeudet
    const owners = await GroupShow.findShareOwnerAndGroupOwner(shareID)

    if (!owners) {
      throw new ApiError('Näytöstä ei löydy', 404)
    }

    const { shareOwnerId, groupOwnerId } = owners
    
    // Tarkistetaan onko käyttäjä joko jakaja tai ryhmän omistaja
    if (shareOwnerId !== userID && groupOwnerId !== userID) {
      throw new ApiError('Ei oikeutta poistaa tätä jakoa', 403)
    }

    // Poistetaan jako
    const deleted = await GroupShow.delete(shareID)
    
    if (!deleted) {
      throw new ApiError('Näytöksen poisto epäonnistui', 500) 
    }

    res.json({ message: 'Näytös poistettu onnistuneesti' })
  } catch (err) {
    next(err)
  }
}