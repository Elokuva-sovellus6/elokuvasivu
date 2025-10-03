import { ApiError } from "../helper/ApiError.js"
import Group from "../models/Group.js"
import JoinRequest from "../models/JoinRequest.js"

// ---             RYHMIEN HAKU & LUONTI            --- //

// Uuden ryhmän luonti
export const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const ownerId = req.user.id
    const file = req.file
    const newGroup = await Group.create(name, description, ownerId, file ? file.filename : null)
    res.status(201).json({ message: "Group created successfully", group: newGroup })
  } catch (err) {
      next(err)
  }
}

// Haetaan ryhmä id:n perusteella
export const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const group = await Group.findById(groupId)

    if (!group) return next(ApiError.notFound("Group not found"))

    res.status(200).json(group)
  } catch (err) {
      next(err)
  }
}

// Haetaan kaikki ryhmät
export const getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAllWithMemberCount()
    res.status(200).json(groups)
  } catch (err) {
      next(err)
  }
}

//Hakee ryhmät, joihin käyttäjä kuuluu
export const getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.findMyGroups(req.user.id)
    res.json(groups)
  } catch (err) {
    next(err)
  }
}

// Päivitä ryhmän tiedot
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params
    const { name, description } = req.body
    const userId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) return res.status(404).json({ message: "Ryhmää ei löytynyt" })
    if (String(group.ownerid) !== String(userId))
      return res.status(403).json({ message: "Vain omistaja voi muokata ryhmää" })

    let groupimg = group.groupimg
    if (req.file) {
      groupimg = req.file.filename
    }

    const updated = await Group.update(groupId, name, description, groupimg)
    res.json(updated)
  } catch (err) {
    console.error("Virhe ryhmän päivityksessä:", err)
    res.status(500).json({ message: "Ryhmän päivitys epäonnistui" })
  }
}


// ---             LIITTYMISPYYNNÖT            --- //

// Käyttäjä lähettää liittymispyynnön
export const sendJoinRequest = async (req, res) => {
  try {
    const { groupId } = req.params
    const userId = req.user.id
        
    // Tarkista banaus
    const banned = await Group.isBanned(groupId, userId)
    if (banned) {
      // tarkistetaan onko aikaraja mennyt
      const now = new Date()
      if (!banned.banneduntil || new Date(banned.banneduntil) > now) {
        return res.status(403).json({ 
          message: "Olet estetty tästä ryhmästä",
          bannedUntil: banned.banneduntil // Palautetaan eston päättymisaika
        })
      }
    }

    const isMember = await Group.isMember(groupId, userId)
    if (isMember) return res.status(400).json({ message: "Olet jo ryhmän jäsen" })

    const existing = await JoinRequest.findPendingByUserAndGroup(groupId, userId)
    if (existing) return res.status(400).json({ message: "Liittymispyyntö on jo lähetetty" })

    const joinRequest = await JoinRequest.create(groupId, userId)
    res.json({ message: "Liittymispyyntö lähetetty", request: joinRequest })
  } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Virhe liittymispyynnössä" })
  }
}

// Omistajan liittymispyyntöjen vastaanotto
export const getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user.id
    const groups = await Group.findByOwner(ownerId)
    const groupIds = groups.map(g => g.groupid)
    if (groupIds.length === 0) return res.json([])

    const requests = await JoinRequest.findPendingByGroups(groupIds)
    // palautetaan frontendille yhteinen ID, username, groupname
    const formatted = requests.map(r => ({
        requestid: r.requestid,
        username: r.username,
        groupname: r.groupname
  }))
    res.json(formatted)
  } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Virhe pyyntöjen haussa" })
  }
}

// Hyväksy tai hylkää pyyntö
export const handleJoinRequest = async (req, res) => {
  try {
    const { requestId, action } = req.params
    const ownerId = req.user.id

    const request = await JoinRequest.findById(requestId)
    if (!request) return res.status(404).json({ message: "Pyyntöä ei löytynyt" })

    const group = await Group.findById(request.groupid)
    if (group.ownerid !== ownerId) return res.status(403).json({ message: "Ei oikeuksia" })

    if (!["accept", "reject"].includes(action)) return res.status(400).json({ message: "Invalid action" })

    if ((action === "accept" && request.status === "accepted") ||
        (action === "reject" && request.status === "rejected")) {
        return res.status(400).json({ message: `Pyyntö on jo ${action}` })
    }

    await JoinRequest.updateStatus(requestId, action === "accept" ? "accepted" : "rejected")

    if (action === "accept") await Group.addMember(request.groupid, request.userid)

    res.json({ message: "ok", requestId })
  } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Virhe pyynnön käsittelyssä" })
  }
}

// ---             JÄSENTEN HALLINTA            --- //

// Hakee kaikki ryhmän jäsenet
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params
    const members = await Group.getMembers(groupId)

    res.json(members)
  } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Virhe jäsenten haussa" })
  }
}

// Käyttäjä eroaa ryhmästä
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params
    const userId = req.user.id

    // Jos käyttäjä on ylläpitäjä, siirretään ryhmä seuraavalle jäsenelle
    const group = await Group.findById(groupId)
    if (group.ownerid === userId) {
      const members = await Group.getMembers(groupId)
      const nextOwner = members.find(m => m.userid !== userId)

      if (nextOwner) {
        await Group.updateOwner(groupId, nextOwner.userid)
        // Jatketaan alla poistamalla jäsenyys
      } else {
          // Ei muita jäseniä -> poista ryhmä
          await Group.delete(groupId)
          return res.json({ message: "Ryhmä poistettu, koska ei muita jäseniä", groupDeleted: true }) 
      }
    }

      await Group.removeMember(groupId, userId)
      res.json({ message: "Olet poistunut ryhmästä", groupDeleted: false }) 
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Virhe ryhmästä poistumisessa" })
  }
}

// Ylläpitäjä potkii jäsenen pois
export const kickMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params
    const { duration } = req.query
    const ownerId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) return res.status(404).json({ message: "Ryhmää ei löytynyt" })
    if (group.ownerid !== ownerId) return res.status(403).json({ message: "Ei oikeuksia" })

    await Group.removeMember(groupId, memberId)
    await Group.banMember(groupId, memberId, duration) 

    res.json({ message: "Jäsen poistettu ja estetty ryhmästä" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Virhe jäsenen poistossa" })
  }
}

// ---             BANNIEN HALLINTA            --- //

// Hakee kaikki bannatut jäsenet
export const getBannedMembers = async (req, res) => {
  try {
    const { groupId } = req.params
    const banned = await Group.getBannedMembers(groupId)
    res.json(banned)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Virhe bannattujen hakemisessa" })
  }
}

// Poistaa bannin
export const unbanMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params
    const result = await Group.unbanMember(groupId, memberId)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Virhe banin poistossa" })
  }
}