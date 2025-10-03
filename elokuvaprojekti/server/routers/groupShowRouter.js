import express from 'express';
import { createGroupShow, getGroupShows, deleteGroupShow } from '../controllers/groupShowController.js';
import { authenticateToken } from '../helper/auth.js';

const router = express.Router();

// Lisää jako
router.post('/', authenticateToken, createGroupShow);

// Hakee ryhmän jaot
router.get('/:groupID', authenticateToken, getGroupShows);

// Poistaa jaon
router.delete('/:shareID', authenticateToken, deleteGroupShow);

export default router;