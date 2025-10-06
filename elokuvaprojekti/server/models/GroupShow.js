import { pool } from '../helper/db.js';

class GroupShow {
  // Luo uuden jaon
  static async create({ groupID, userID, showID, eventID, tmdbID, theatre, auditorium, showTime, reason, image, url, movieName }) {
    const result = await pool.query(
      `INSERT INTO groupshows 
       (groupid, userid, showid, eventid, tmdbid, theatre, auditorium, showtime, reason, image, url, moviename) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        groupID,
        userID,
        showID,
        eventID,
        tmdbID || null,
        theatre,
        auditorium || null,
        showTime,
        reason || null,
        image || null,
        url || null,
        movieName || null
      ]
    )
    return result.rows[0]
  }

  // Hakee kaikki jaot tietyssä ryhmässä
  static async findByGroup(groupID) {
    const result = await pool.query(
      `SELECT gs.shareid, gs.groupid, gs.userid, gs.showid, gs.eventid, gs.tmdbid,
              gs.theatre, gs.auditorium, gs.showtime, gs.reason, gs.image, gs.url,
              gs.moviename AS "movieName",   -- alias camelCaselle
              u.username, u.userimg
       FROM groupshows gs
       JOIN users u ON gs.userid = u.userid
       WHERE gs.groupid = $1
       ORDER BY gs.sharedat DESC`,
      [groupID]
    )
    return result.rows;
  }

  // Hakee yksittäisen jaon
  static async findById(shareID) {
    const result = await pool.query(
      `SELECT * FROM groupshows WHERE shareid = $1`,
      [shareID]
    )
    return result.rows[0]
  }

  // Hakee jaon tiedot sekä ryhmän omistajan ID:n oikeuksien tarkistusta varten
  static async findShareOwnerAndGroupOwner(shareID) {
    const result = await pool.query(
      `SELECT gs.userid AS "shareOwnerId", g.ownerid AS "groupOwnerId"
       FROM groupshows gs
       JOIN groups g ON gs.groupid = g.groupid
       WHERE gs.shareid = $1`,
      [shareID]
    )
    return result.rows[0]
  }

  // Poistaa jaon
  static async delete(shareID) {
    const result = await pool.query(
      `DELETE FROM groupshows WHERE shareid = $1 RETURNING shareid`,
      [shareID]
    )
    // Palauttaa tosi, jos poisto onnistui
    return result.rowCount > 0 
  }
}

export default GroupShow