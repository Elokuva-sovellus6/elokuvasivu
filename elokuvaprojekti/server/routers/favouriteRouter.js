const express = require('express');
const { getFavourites, addFavourite, removeFavourite, getFavouriteList } = require('../controllers/favouriteController.js');
const { authenticateToken } = require('../helper/auth.js');

const router = express.Router();

// Lisää elokuvan suosikkeihin
router.post('/add', authenticateToken, addFavourite);

// Poista elokuva suosikeista
router.delete('/:tmdbId', authenticateToken, removeFavourite);

// Hae käyttäjän suosikit
router.get('/', authenticateToken, getFavourites);

// Hae käyttäjän suosikkilista julkisesti
router.get('/:userId/public', getFavouriteList);

module.exports = router;