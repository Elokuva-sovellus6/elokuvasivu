import express from 'express'
import { getMe, deleteMe, updateMe } from '../controllers/userController.js'
import { authenticateToken } from '../helper/auth.js'
import multer from "multer"

const router = express.Router()

// Määritellään minne tallennetaan
const uploadUser = multer({ storage: multer.memoryStorage() })

router.get('/me', authenticateToken, getMe)       // Hakee käyttäjän tiedot
router.delete('/me', authenticateToken, deleteMe)  // Poistaa käyttäjän
router.put('/me', authenticateToken, uploadUser.single('userImg'), updateMe)     // Profiilin kuvan ja kuvauksen lisäys

export default router