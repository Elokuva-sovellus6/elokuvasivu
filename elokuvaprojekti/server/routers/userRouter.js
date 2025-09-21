import express from 'express';
import { getMe, deleteMe } from '../controllers/userController.js';
import { authenticateToken } from '../helper/auth.js';

const router = express.Router();

router.get('/me', authenticateToken, getMe);        // Hakee käyttäjän tiedot
router.delete('/me', authenticateToken, deleteMe);  // Poistaa käyttäjän

export default router;