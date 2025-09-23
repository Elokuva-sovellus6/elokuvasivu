import express from "express"
import { createGroup, getGroupById, getAllGroups } from "../controllers/groupController.js"
import { authenticateToken } from "../helper/auth.js"

const router = express.Router()

// Luo uusi ryhmä
router.post("/", authenticateToken, createGroup)

// Haetaan kaikki ryhmät
router.get("/", getAllGroups)

// Haetaan ryhmä sen id:n perusteella
router.get("/:groupId", getGroupById)

export default router