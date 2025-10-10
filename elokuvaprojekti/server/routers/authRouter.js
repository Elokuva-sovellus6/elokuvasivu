import express from 'express';
import { register, login, signout } from '../controllers/authController.js';

const router = express.Router()

router.post('/register', register) // Rekisteröintireitti
router.post('/login', login) // Kirjautumisreitti
router.post('/signout', signout) // Uloskirjautumisreitti

export default router