import express from "express";
import {addChatMessage, getGroupMessages, removeChatMessage} from "../controllers/groupChatController.js";
import { authenticateToken } from "../helper/auth.js";

const router = express.Router();

// Hae kaikki viestit ryhmästä
router.get("/:groupID", authenticateToken, getGroupMessages);

// Lisää uusi viesti
router.post("/", authenticateToken, addChatMessage);

// Poista oma viesti tai ryhmän omistajana muidenkin
router.delete("/:postID", authenticateToken, removeChatMessage);

export default router;