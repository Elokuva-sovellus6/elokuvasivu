import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register); // Rekisteröintireitti
router.post('/login', login); // Kirjautumisreitti

export default router;