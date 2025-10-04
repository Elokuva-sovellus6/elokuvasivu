import express from 'express';
import { authenticateToken } from '../helper/auth.js';
import { createGroupMovie, getGroupMovies, deleteGroupMovie } from '../controllers/groupMovieController.js';

const router = express.Router();

// GET /groupmovies/:groupID → hae ryhmän elokuvat
router.get('/:groupID', authenticateToken, getGroupMovies);

// POST /groupmovies → lisää uusi elokuva ryhmälle
router.post('/', authenticateToken, createGroupMovie);

// DELETE /groupmovies/:shareID → poista jako
router.delete('/:shareID', authenticateToken, deleteGroupMovie);

export default router;