// controllers/favouriteController.js
import { pool } from '../helper/db.js';
import Favourite from '../models/Favourite.js';

// Lisää elokuva käyttäjän suosikkeihin
export const addFavourite = async (req, res) => {
    const userId = req.user.id;
    const { tmdbId } = req.body;
    if (!tmdbId) return res.status(400).json({ message: 'tmdbId puuttuu' });

    try {
        await Favourite.add(userId, tmdbId);
        res.status(201).json({ message: 'Elokuva lisätty suosikkeihin' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Poistaa elokuvan käyttäjän suosikeista
export const removeFavourite = async (req, res) => {
    const userId = req.user.id;
    const { tmdbId } = req.params;

    if (!tmdbId) return res.status(400).json({ message: 'tmdbId puuttuu' });

    try {
        await Favourite.remove(userId, tmdbId);
        res.status(200).json({ message: 'Elokuva poistettu suosikeista' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Hakee kaikki käyttäjän suosikit
export const getFavourites = async (req, res) => {
    const userId = req.user.id;

    try {
        const favourites = await Favourite.getByUser(userId);
        res.status(200).json(favourites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Hakee käyttäjän suosikkilistan julkisesti
export const getFavouriteList = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `SELECT u.username, f.tmdbid
             FROM favourites f
             JOIN users u ON f.userid = u.userid
             WHERE u.userid = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Käyttäjällä ei ole suosikkeja' });
        }

        res.status(200).json({
            username: result.rows[0].username,
            favourites: result.rows.map(r => ({ tmdbId: r.tmdbid }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
