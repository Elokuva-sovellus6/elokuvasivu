import { pool } from '../helper/db.js';

class Group {
    static async create(name, description, ownerid, groupimg) {
        
        const result = await pool.query(
            "INSERT INTO groups (name, description, ownerid, groupimg , createddate) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [name, description, ownerid, groupimg]
        )

        const newGroup = result.rows[0]
        console.log("Luotu ryhmä:", newGroup)

        await pool.query(
            "INSERT INTO groupmembers (groupid, userid, ismember, membersince) VALUES ($1, $2, true, NOW())",
            [newGroup.groupid, ownerid]
        )
        console.log("Lisätty jäsen:", ownerid)

        return newGroup
    }

    static async findAllWithMemberCount() {
    const result = await pool.query(`
      SELECT g.*,
             COUNT(m.userid) AS membercount
      FROM groups g
      LEFT JOIN groupmembers m
             ON g.groupid = m.groupid AND m.ismember = true
      GROUP BY g.groupid
      ORDER BY g.createddate DESC
    `)
        return result.rows
    }

    static async findById(id) {
        const result = await pool.query("SELECT * FROM groups WHERE groupid = $1", [id])
        return result.rows[0]
    }

    static async findAll() {
        const result = await pool.query("SELECT * FROM groups ORDER BY createddate DESC")
        return result.rows
    }
}

export default Group