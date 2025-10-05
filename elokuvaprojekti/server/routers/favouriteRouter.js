import express from 'express';
import { getFavourites, addFavourite, removeFavourite, getFavouriteList } from '../controllers/favouriteController.js';
import { authenticateToken } from '../helper/auth.js';

const router = express.Router();

// Lisää elokuvan suosikkeihin
router.post('/add', authenticateToken, addFavourite);

// Poista elokuva suosikeista
router.delete('/:tmdbId', authenticateToken, removeFavourite);

// Hae käyttäjän suosikit
router.get('/', authenticateToken, getFavourites);

// Hae käyttäjän suosikkilista julkisesti
router.get('/:userId/public', getFavouriteList);

export default router;