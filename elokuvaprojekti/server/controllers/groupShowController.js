import GroupShow from '../models/GroupShow.js';
import { ApiError } from '../helper/ApiError.js';
import { pool } from '../helper/db.js';

// Luo uuden jaon
export const createGroupShow = async (req, res, next) => {
  try {
    const { groupID, showID, eventID, tmdbID, theatre, auditorium, showTime, reason, image, url, movieName } = req.body;
    const userID = req.user.id;

    if (!groupID || !showID || !eventID || !theatre || !showTime) {
      throw new ApiError('Pakollisia tietoja puuttuu', 400);
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
    });

    res.status(201).json(newShare);
  } catch (err) {
    next(err);
  }
};

// Hakee kaikki jaot ryhmästä
export const getGroupShows = async (req, res, next) => {
  try {
    const { groupID } = req.params;
    const shares = await GroupShow.findByGroup(groupID);
    res.json(shares);
  } catch (err) {
    next(err);
  }
};

// Poistaa jaon
export const deleteGroupShow = async (req, res, next) => {
  try {
    const { shareID } = req.params;
    const userID = req.user.id;

    // Tarkistetaan oikeudet
    const check = await pool.query(
      `SELECT gs.userid, g.ownerid
       FROM groupshows gs
       JOIN groups g ON gs.groupid = g.groupid
       WHERE gs.shareid = $1`,
      [shareID]
    );

    if (check.rows.length === 0) {
      throw new ApiError('Näytöstä ei löydy', 404);
    }

    const row = check.rows[0];
    if (row.userid !== userID && row.ownerid !== userID) {
      throw new ApiError('Ei oikeutta poistaa tätä jakoa', 403);
    }

    await GroupShow.delete(shareID);
    res.json({ message: 'Näytös poistettu onnistuneesti' });
  } catch (err) {
    next(err);
  }
};