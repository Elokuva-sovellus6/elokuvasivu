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

    // Hae käyttäjän kaikki arvostelut
    static async findByUserId(userid) {
        const result = await pool.query(
            `SELECT r.reviewid,
                    r.tmdbid,
                    r.rating,
                    r.reviewtext,
                    r.reviewdate
            FROM reviews r
            WHERE r.userid = $1
            ORDER BY r.reviewdate DESC`,
            [userid]
        );
        return result.rows;
    }

    // Hae uusimmat arvostelut
    static async findLatest(limit = 10) {
        const result = await pool.query(
        `SELECT r.reviewid, r.tmdbid, r.userid, r.rating, r.reviewtext, r.reviewdate, u.username
        FROM reviews r
        JOIN users u ON r.userid = u.userid
        ORDER BY r.reviewdate DESC
        LIMIT $1`,
        [limit]
        );
        return result.rows;
    }

    // Poista arvostelu id:llä
    static async delete(reviewid) {
        const result = await pool.query(
        `DELETE FROM reviews WHERE reviewid = $1 RETURNING reviewid`,
        [reviewid]
        )
        return result.rows[0]
    }
}

export default Review;