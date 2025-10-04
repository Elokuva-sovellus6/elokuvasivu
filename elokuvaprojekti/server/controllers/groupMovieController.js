import GroupMovie from '../models/groupMovie.js';
import { ApiError } from '../helper/ApiError.js';
import { pool } from '../helper/db.js';

// Luo uuden jaon
export const createGroupMovie = async (req, res, next) => {
  try {
    const { groupID, tmdbID, movieName, image, url, reason } = req.body;
    const userID = req.user.id;

    if (!groupID || !tmdbID || !movieName) {
      throw new ApiError('Pakollisia tietoja puuttuu', 400);
    }

    const newShare = await GroupMovie.create({
      groupID,
      userID,
      tmdbID,
      movieName,
      image,
      url,
      reason
    });

    res.status(201).json(newShare);
  } catch (err) {
    next(err);
  }
};

// Hakee kaikki jaot ryhmästä
export const getGroupMovies = async (req, res, next) => {
  try {
    const { groupID } = req.params;
    const shares = await GroupMovie.findByGroup(groupID);
    res.json(shares);
  } catch (err) {
    next(err);
  }
};

// Poistaa jaon
export const deleteGroupMovie = async (req, res, next) => {
  try {
    const { shareID } = req.params;
    const userID = req.user.id;

    // Tarkistetaan oikeudet (omistaja tai ryhmän owner)
    const check = await pool.query(
      `SELECT gm.userid, g.ownerid
       FROM groupmovies gm
       JOIN groups g ON gm.groupid = g.groupid
       WHERE gm.shareid = $1`,
      [shareID]
    );

    if (check.rows.length === 0) {
      throw new ApiError('Elokuvaa ei löydy', 404);
    }

    const row = check.rows[0];
    if (row.userid !== userID && row.ownerid !== userID) {
      throw new ApiError('Ei oikeutta poistaa tätä jakoa', 403);
    }

    await GroupMovie.delete(shareID);
    res.json({ message: 'Elokuva poistettu onnistuneesti' });
  } catch (err) {
    next(err);
  }
};