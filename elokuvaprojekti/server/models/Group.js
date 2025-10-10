import { pool } from "../helper/db.js";

class Group {

// ---             RYHMÄN PERUSTOIMINNOT            ---//

  // Uuden ryhmän luonti ja omistajan lisääminen jäseneksi
  static async create(name, description, ownerid, groupimg) {
    const result = await pool.query(
      `INSERT INTO groups (name, description, ownerid, groupimg , createddate) 
      VALUES ($1,$2,$3,$4,NOW()) 
      RETURNING *`,
      [name, description, ownerid, groupimg]
    )
    const newGroup = result.rows[0]
    await pool.query(
      `INSERT INTO groupmembers (groupid, userid, ismember, membersince) 
      VALUES ($1,$2,true, NOW())`,
      [newGroup.groupid, ownerid]
    )
    return newGroup
  }

  // Hakee kaikki ryhmät jäsenmäärän kanssa
  static async findAllWithMemberCount() {
    const result = await pool.query(
      `SELECT g.*, COUNT(m.userid) AS membercount
      FROM groups g
      LEFT JOIN groupmembers m
      ON g.groupid = m.groupid 
      AND m.ismember = true
      GROUP BY g.groupid`
    )
    return result.rows
  }

  // Hakee ryhmän ID:n perusteella
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM groups 
      WHERE groupid = $1`, 
      [id])
    return result.rows[0]
  }

  // Etsi ryhmän omistajan ID:n perusteella
  static async findByOwner(ownerId) {
    const result = await pool.query(
      `SELECT groupid FROM groups 
      WHERE ownerid = $1`, 
      [ownerId])
    return result.rows
  }

  // Päivittää ryhmän omistajan
  static async updateOwner(groupId, newOwnerId) {
    const result = await pool.query(
      `UPDATE groups SET ownerid = $1 
      WHERE groupid = $2 
      RETURNING *`,
      [newOwnerId, groupId]
    )
    return result.rows[0]
  }

  // Päivittää ryhmän tiedot
  static async update(groupId, name, description, groupimg) {
    const result = await pool.query(
      `UPDATE groups SET name = $1, description = $2, groupimg = $3 WHERE groupid = $4 RETURNING *`,
      [name, description, groupimg, groupId]
    );
    return result.rows[0];
  }

  // Hakee ryhmät, joihin käyttäjä kuuluu
  static async findMyGroups(userId) {
    const result = await pool.query(
      `SELECT g.* 
      FROM groupmembers gm
      JOIN groups g ON gm.groupid = g.groupid
      WHERE gm.userid = $1 AND gm.ismember = true`,
      [userId]
    );
    return result.rows;
  }


// ---             JÄSENTEN HALLINTA            ---//

  // Tarkistaa onko käyttäjä jäsen
  static async isMember(groupId, userId) {
    const result = await pool.query(
      `SELECT * FROM groupmembers 
      WHERE groupid = $1 
      AND userid = $2 
      AND ismember = true`,
      [groupId, userId]
    )
    return result.rows.length > 0
  }

  // Lisää jäsenen ryhmään
  static async addMember(groupId, userId) {
    const result = await pool.query(
      `INSERT INTO groupmembers (groupid, userid, ismember, membersince) 
      VALUES ($1,$2,true,NOW()) 
      RETURNING *`,
      [groupId, userId]
    )
    return result.rows[0]
  }

  // Hakee kaikki ryhmän jäsenet
  static async getMembers(groupId) {
    const result = await pool.query(
      `SELECT u.userid, u.username, m.membersince
      FROM groupmembers m
      JOIN users u ON m.userid = u.userid
      WHERE m.groupid = $1 AND m.ismember = true
      ORDER BY m.membersince ASC`,
      [groupId]
    )
    return result.rows
  }

  // Poistaa jäsenen ryhmästä
  static async removeMember(groupId, userId) {
    const result = await pool.query(
      `DELETE FROM groupmembers 
      WHERE groupid = $1 
      AND userid = $2 
      AND ismember = true`,
      [groupId, userId]
    )
    return result.rows
  }


// ---             BANNIT            ---//

  // Lisää käyttäjän bannilistalle (mukaan lukien kesto)
  static async banMember(groupId, userId, duration) {
    let bannedUntil = null
    if (duration && duration !== "perma") {
        const days = parseInt(duration, 10)
        if (!isNaN(days) && days > 0) {
            bannedUntil = new Date()
            bannedUntil.setDate(bannedUntil.getDate() + days)
        }
    }
    await pool.query(
      `INSERT INTO groupbans (groupid, userid, banneduntil)
      VALUES ($1, $2, $3)
      ON CONFLICT (groupid, userid) 
      DO UPDATE SET banneduntil = EXCLUDED.banneduntil`,
      [groupId, userId, bannedUntil]
    )
  }

  // Tarkistaa onko käyttäjä bannattu (palauttaa banneduntil-tiedon)
  static async isBanned(groupId, userId) {
    const res = await pool.query(
      `SELECT banneduntil FROM groupbans
      WHERE groupid = $1 
      AND userid = $2`,
      [groupId, userId]
    )
    return res.rows[0] || null
  }

  // Hakee kaikki bannatut jäsenet
  static async getBannedMembers(groupId) {
    const result = await pool.query(
      `SELECT u.userid, u.username, g.banneduntil
      FROM groupbans g
      JOIN users u ON g.userid = u.userid
      WHERE g.groupid = $1`,
      [groupId]
    )
    return result.rows
  }

  // Poistaa bannin
  static async unbanMember(groupId, memberId) {
    await pool.query(
      `DELETE FROM groupbans 
      WHERE groupid=$1 
      AND userid=$2`,
      [groupId, memberId]
    )
    return { message: "Ban poistettu" }
  }


// ---             RYHMÄN POISTAMINEN            ---//

  // Poistaa ryhmän kokonaan (sisältää jäsenet, pyynnöt ja bannit)
  static async delete(groupId) {
    // 1. Poistetaan ryhmän liittymispyynnöt
    await pool.query(
      `DELETE FROM joinrequests
      WHERE groupid = $1`, 
      [groupId])

    // 2. Poistetaan ryhmän bannaukset
    await pool.query(
      `DELETE FROM groupbans 
      WHERE groupid = $1`, 
      [groupId])

    // 3. Poistetaan ryhmän jäsenet
    await pool.query(
      `DELETE FROM groupmembers 
      WHERE groupid = $1`, 
      [groupId])

    // 4. Poistetaan itse ryhmä
    await pool.query(
      `DELETE FROM groups 
      WHERE groupid = $1`, 
      [groupId])
  }
}

export default Group