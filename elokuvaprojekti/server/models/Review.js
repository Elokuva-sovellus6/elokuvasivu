import { pool } from '../helper/db.js';

class Review {
    static async create(tmdbid, userid, rating, reviewtext) {
        const result = await pool.query(
            "INSERT INTO reviews (tmdbid, userid, rating, reviewtext, reviewdate) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [tmdbid, userid, rating, reviewtext]
        );
        return result.rows[0];
    }
    
    static async findByTmdbId(tmdbid) {
        const result = await pool.query(
            "SELECT r.*, u.username FROM reviews r JOIN users u ON r.userid = u.userid WHERE r.tmdbid = $1",
            [tmdbid]
        );
        return result.rows;
    }
}

export default Review;