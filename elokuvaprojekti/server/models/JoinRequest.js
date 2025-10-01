import { pool } from "../helper/db.js";

class JoinRequest {

// ---             LUONTI & PÄIVITYS            ---//

  // Luo uuden liittymispyynnön (status 'pending')
  static async create(groupId, userId) {
    const result = await pool.query(
      `INSERT INTO joinrequests (groupid, userid, status, createddate) 
      VALUES ($1,$2,'pending',NOW()) 
      RETURNING *`,
      [groupId, userId]
    )
    return result.rows[0]
  }

  // Päivittää liittymispyynnön tilan (esim. 'accepted' tai 'rejected')
  static async updateStatus(requestId, status) {
    const result = await pool.query(
      `UPDATE joinrequests SET status=$1 
      WHERE requestid=$2 
      RETURNING *`,
      [status, requestId]
    )
    return result.rows[0]
  }


// ---             HAKUTOIMINNOT            ---//

  // Etsii liittymispyynnön ID:n perusteella
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM joinrequests 
      WHERE requestid = $1`, [id])
    return result.rows[0]
  }

  // Etsii odottavan liittymispyynnön käyttäjän ja ryhmän ID:n perusteella
  static async findPendingByUserAndGroup(groupId, userId) {
    const result = await pool.query(
      `SELECT * FROM joinrequests 
      WHERE groupid = $1 
      AND userid = $2 
      AND status='pending'`,
      [groupId, userId]
    )
    return result.rows[0]
  }

  // Etsii kaikki odottavat liittymispyynnöt annettujen ryhmän ID:iden perusteella
  static async findPendingByGroups(groupIds) {
    const result = await pool.query(
      `SELECT jr.requestid, u.username, g.name AS groupname
      FROM joinrequests jr
      JOIN users u 
      ON u.userid = jr.userid
      JOIN groups g 
      ON g.groupid = jr.groupid
      WHERE jr.groupid = ANY($1::int[]) 
      AND jr.status='pending'`,
      [groupIds]
    )
    return result.rows
  }
}

export default JoinRequest