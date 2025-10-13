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

    let groupimg = null
    if (file) {
      const base64 = file.buffer.toString("base64")
      const mime = file.mimetype;
      groupimg = `data:${mime};base64,${base64}`
    }

    const newGroup = await Group.create(name, description, ownerId, groupimg)
    res.status(201).json({ message: "Ryhmä luotu onnistuneesti", group: newGroup })
  } catch (err) {
      next(err)
  }
}

// Haetaan ryhmä id:n perusteella
export const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const group = await Group.findById(groupId)

    if (!group) return next(ApiError.notFound("Ryhmää ei löytynyt"))

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
export const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const { name, description } = req.body
    const userId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) throw new ApiError("Ryhmää ei löytynyt", 404)
    if (String(group.ownerid) !== String(userId))
      throw new ApiError("Vain omistaja voi muokata ryhmää", 403)

    let groupimg = group.groupimg;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const mime = req.file.mimetype;
      groupimg = `data:${mime};base64,${base64}`;
    }

    const updated = await Group.update(groupId, name, description, groupimg)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}


// ---             LIITTYMISPYYNNÖT            --- //

// Käyttäjä lähettää liittymispyynnön
export const sendJoinRequest = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const userId = req.user.id
        
    // Tarkista banaus
    const banned = await Group.isBanned(groupId, userId)
    if (banned) {
      // tarkistetaan onko aikaraja mennyt
      const now = new Date()
      if (!banned.banneduntil || new Date(banned.banneduntil) > now) {
        throw new ApiError("Olet estetty tästä ryhmästä", 403)
      }
    }

    const isMember = await Group.isMember(groupId, userId)
    if (isMember) throw new ApiError("Olet jo ryhmän jäsen", 400)

    const existing = await JoinRequest.findPendingByUserAndGroup(groupId, userId)
    if (existing) throw new ApiError("Liittymispyyntö on jo lähetetty", 400)

    const joinRequest = await JoinRequest.create(groupId, userId)
    res.json({ message: "Liittymispyyntö lähetetty", request: joinRequest })
  } catch (err) {
      next(err)
  }
}

// Omistajan liittymispyyntöjen vastaanotto
export const getOwnerRequests = async (req, res, next) => {
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
      next(err)
  }
}

// Hyväksy tai hylkää pyyntö
export const handleJoinRequest = async (req, res, next) => {
  try {
    const { requestId, action } = req.params
    const ownerId = req.user.id

    const request = await JoinRequest.findById(requestId)
    if (!request) throw new ApiError("Pyyntöä ei löytynyt", 404)

    const group = await Group.findById(request.groupid)
    if (group.ownerid !== ownerId) throw new ApiError("Ei oikeuksia", 403)

    if (!["accept", "reject"].includes(action)) throw new ApiError("Invalid action", 400)

    if ((action === "accept" && request.status === "accepted") ||
        (action === "reject" && request.status === "rejected")) {
        throw new ApiError(`Pyyntö on jo ${action}`, 400)
    }

    await JoinRequest.updateStatus(requestId, action === "accept" ? "accepted" : "rejected")

    if (action === "accept") await Group.addMember(request.groupid, request.userid)

    res.json({ message: "ok", requestId })
  } catch (err) {
      next(err)
  }
}

// ---             JÄSENTEN HALLINTA            --- //

// Hakee kaikki ryhmän jäsenet
export const getGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const members = await Group.getMembers(groupId)

    res.json(members)
  } catch (err) {
      next(err)
  }
}

// Käyttäjä eroaa ryhmästä
export const leaveGroup = async (req, res, next) => {
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
          // Ei muita jäseniä -> poistetaan ryhmä
          await Group.delete(groupId)
          return res.json({ message: "Ryhmä poistettu, koska ei muita jäseniä", groupDeleted: true }) 
      }
    }

      await Group.removeMember(groupId, userId)
      res.json({ message: "Olet poistunut ryhmästä", groupDeleted: false }) 
  } catch (err) {
    next(err)
  }
}

// Ylläpitäjä potkii jäsenen pois
export const kickMemberFromGroup = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params
    const { duration } = req.query
    const ownerId = req.user.id

    const group = await Group.findById(groupId)
    if (!group) throw new ApiError("Ryhmää ei löytynyt", 404)
    if (group.ownerid !== ownerId) throw new ApiError("Ei oikeuksia", 403)

    await Group.removeMember(groupId, memberId)
    await Group.banMember(groupId, memberId, duration) 

    res.json({ message: "Jäsen poistettu ja estetty ryhmästä" })
  } catch (err) {
    next(err)
  }
}

// ---             BANNIEN HALLINTA            --- //

// Hakee kaikki bannatut jäsenet
export const getBannedMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const banned = await Group.getBannedMembers(groupId)
    res.json(banned)
  } catch (err) {
    next(err)
  }
}

// Poistaa bannin
export const unbanMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params
    const result = await Group.unbanMember(groupId, memberId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// Poistaa ryhmän (vain omistajalle)
export const deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError("Ryhmää ei löytynyt", 404);
    if (String(group.ownerid) !== String(userId))
      throw new ApiError("Vain omistaja voi poistaa ryhmän!", 403);

    await Group.delete(groupId); 
    res.json({ message: "Ryhmä poistettu onnistuneesti" });
  } catch (err) {
    next(err);
  }
}