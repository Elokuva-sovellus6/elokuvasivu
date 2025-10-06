// models/Favourite.js
import { pool } from '../helper/db.js'

// Käyttäjän suosikit
class Favourite {
    static async add(userId, tmdbId) {
        await pool.query(
            `INSERT INTO favourites (userid, tmdbid) 
             VALUES ($1, $2) 
             ON CONFLICT DO NOTHING`,
            [userId, tmdbId]
        )
    }

    // Poistaa elokuvan käyttäjän suosikeista
    static async remove(userId, tmdbId) {
        await pool.query(
            `DELETE FROM favourites 
             WHERE userid = $1 
             AND tmdbid = $2`,
            [userId, tmdbId]
        )
    }

    // Hakee käyttäjän suosikit
    static async getByUser(userId) {
        const result = await pool.query(
            `SELECT tmdbid 
             FROM favourites 
             WHERE userid = $1`,
            [userId]
        )
        return result.rows
    }
    
    // Hakee käyttäjän suosikkilistan julkisesti
    static async getPublicList(userId) {
        const result = await pool.query(
            `SELECT u.username, f.tmdbid
             FROM favourites f
             JOIN users u ON f.userid = u.userid
             WHERE u.userid = $1`,
            [userId]
        )
        return result.rows
    }
}

export default Favourite