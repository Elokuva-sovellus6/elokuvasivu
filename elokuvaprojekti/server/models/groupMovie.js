import { pool } from '../helper/db.js'

class GroupMovie {
  // Luo uuden jaon
  static async create({ groupID, userID, tmdbID, movieName, image, url, reason }) {
    const result = await pool.query(
      `INSERT INTO groupmovies 
       (groupid, userid, tmdbid, moviename, image, url, reason) 
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        groupID,
        userID,
        tmdbID,
        movieName || null,
        image || null,
        url || null,
        reason || null
      ]
    )
    return result.rows[0]
  }

  // Hakee jaon tekijän ID:n ja ryhmän omistajan ID:n oikeuksien tarkistusta varten
  static async findShareAndGroupOwner(shareID) {
    const result = await pool.query(
      `SELECT gm.userid, g.ownerid
       FROM groupmovies gm
       JOIN groups g ON gm.groupid = g.groupid
       WHERE gm.shareid = $1`,
      [shareID]
    )
    return result.rows[0]
  }

  // Hakee kaikki jaot tietyssä ryhmässä
  static async findByGroup(groupID) {
    const result = await pool.query(
      `SELECT gm.shareid, gm.groupid, gm.userid, gm.tmdbid,
              gm.moviename AS "movieName", 
              gm.image, gm.url, gm.reason, gm.sharedat,
              u.username, u.userimg
       FROM groupmovies gm
       JOIN users u ON gm.userid = u.userid
       WHERE gm.groupid = $1
       ORDER BY gm.sharedat DESC`,
      [groupID]
    )
    return result.rows
  }

  // Hakee kaikki jaot (ilman groupID:tä)
  static async findAll() {
    const result = await pool.query(
      `SELECT gm.shareid, gm.groupid, gm.userid, gm.tmdbid,
              gm.moviename AS "movieName", 
              gm.image, gm.url, gm.reason, gm.sharedat,
              u.username, u.userimg
       FROM groupmovies gm
       JOIN users u ON gm.userid = u.userid
       ORDER BY gm.sharedat DESC`
    )
    return result.rows
  }

  // Hakee yksittäisen jaon
  static async findById(shareID) {
    const result = await pool.query(
      `SELECT gm.shareid, gm.groupid, gm.userid, gm.tmdbid,
              gm.moviename AS "movieName",
              gm.image, gm.url, gm.reason, gm.sharedat,
              u.username, u.userimg
       FROM groupmovies gm
       JOIN users u ON gm.userid = u.userid
       WHERE gm.shareid = $1`,
      [shareID]
    )
    return result.rows[0]
  }

  // Poistaa jaon
  static async delete(shareID) {
    const result = await pool.query(
      `DELETE FROM groupmovies WHERE shareid = $1 RETURNING shareid`,
      [shareID]
    )
    return result.rows.length > 0
  }
}

export default GroupMovie