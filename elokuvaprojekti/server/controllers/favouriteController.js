const Favourite = require('../models/Favourite.js');

// Lisää elokuva käyttäjän suosikkeihin
const addFavourite = async (req, res) => {
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
const removeFavourite = async (req, res) => {
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
const getFavourites = async (req, res) => {
    const userId = req.user.id;

    try {
        const favourites = await Favourite.getByUser(userId);
        res.status(200).json(favourites);
    } catch (error) {
        console.error(error);
            res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addFavourite,
    removeFavourite,
    getFavourites
};