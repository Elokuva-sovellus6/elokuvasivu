import { ApiError } from "../helper/ApiError.js"
import Group from "../models/Group.js"

// Uuden ryhmän luonti
export const createGroup = async (req, res, next) => {
    try {
        const { name, description, groupimg } = req.body
        const ownerId = req.user.id

        // Luodaan ryhmä (luoja lisätään jäseneksi suoraan Group.js:ssä)
        const newGroup = await Group.create(name, description, ownerId, groupimg)

        res.status(201).json({ message: "Group created successfully", group: newGroup })
    } catch (err) {
        next(err)
    }
}

// Funktio jolla haetaan ryhmä id:n perusteella
export const getGroupById = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId)

        if (!group) {
            return next(ApiError.notFound('Group not found'))
        }

        res.status(200).json(group);
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