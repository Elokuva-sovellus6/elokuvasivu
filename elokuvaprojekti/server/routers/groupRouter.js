import express from "express"
import { createGroup, getGroupById, getAllGroups, sendJoinRequest, getOwnerRequests, handleJoinRequest, getGroupMembers, leaveGroup, kickMemberFromGroup, getBannedMembers, unbanMember, updateGroup, getMyGroups } from "../controllers/groupController.js"
import { authenticateToken } from "../helper/auth.js"
import { deleteGroup } from "../controllers/groupController.js"
import multer from "multer"

const router = express.Router()

// määritellään minne tallennetaan
const uploadGroup = multer({ storage: multer.memoryStorage() })

// Luo uusi ryhmä
router.post("/", authenticateToken, uploadGroup.single("groupimg"), createGroup)

// Haetaan kaikki ryhmät
router.get("/", getAllGroups)

// Ryhmän omistaja saa liittymispyynnön
router.get("/owned/requests", authenticateToken, getOwnerRequests)

router.get('/mine', authenticateToken, getMyGroups);

// Haetaan ryhmä sen id:n perusteella
router.get("/:groupId", getGroupById)

// Käyttäjä lähettää liittymispyynnön ryhmään
router.post("/:groupId/join-request", authenticateToken, sendJoinRequest)

// Omistaja hyväksyy tai hylkää pyynnön
router.post("/join-requests/:requestId/:action", authenticateToken, handleJoinRequest)

// Hakee ryhmän jäsenet
router.get('/:groupId/members', authenticateToken, getGroupMembers)

// Käyttäjä eroaa ryhmästä
router.post('/:groupId/leave', authenticateToken, leaveGroup)

// Ylläpitäjä poistaa jäsenen
router.delete("/:groupId/kick/:memberId", authenticateToken, kickMemberFromGroup)

router.get('/:groupId/banned', authenticateToken, getBannedMembers)

router.delete('/:groupId/unban/:memberId', authenticateToken, unbanMember)

// Päivitä ryhmän tiedot (kuvaus, kuva) -- vain omistajalle!
router.put("/:groupId", authenticateToken, uploadGroup.single("groupimg"), updateGroup)

// Ryhmän poistaminen
router.delete("/:groupId", authenticateToken, deleteGroup);

export default router