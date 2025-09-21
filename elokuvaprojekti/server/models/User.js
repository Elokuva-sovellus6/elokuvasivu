import { pool } from '../helper/db.js'
import bcrypt from 'bcryptjs'

class User {
    static async create(username, email, password) {
        // Hashaa salasana ennen tallentamista
        const hashedPassword = await bcrypt.hash(password, 10)

        // Tallentaa käyttäjän tietokantaan
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING userid',
            [username, email, hashedPassword]
        )
        return result.rows[0]
    }

    // Etsii käyttäjän sähköpostin perusteella
    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        return result.rows[0]
    }

    // Etsii käyttäjän id:n perusteella
    static async findById(id) {
    const result = await pool.query('SELECT userid, username, email, userdescription, userimg, joindate FROM users WHERE userid = $1', [id]);
    return result.rows[0];
  }

  // Poistaa käyttäjän id:n perusteella
  static async delete(id) {
    const result = await pool.query('DELETE FROM users WHERE userid = $1 RETURNING userid', [id]);
    return result.rows[0];
  }
}

export default User