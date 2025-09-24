import { pool } from '../helper/db.js';

class Group {
    static async create(name, description, ownerid, groupimg) {
        const result = await pool.query(
            "INSERT INTO groups (name, description, ownerid, groupimg , createddate) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [name, description, ownerid, groupimg]
        )
        return result.rows[0]
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