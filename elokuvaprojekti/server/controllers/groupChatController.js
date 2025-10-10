import {createGroupChat, getGroupChatsByGroup, deleteGroupChat, getGroupOwner,} from "../models/GroupChat.js";
import { ApiError } from "../helper/ApiError.js";

// Lisää uusi viesti
export const addChatMessage = async (req, res, next) => {
  try {
    const { groupID, chatText } = req.body;
    const userID = req.user.id

    if (!groupID || !chatText) {
      throw new ApiError(400, "groupID ja chatText vaaditaan");
    }

    const newMessage = await createGroupChat(userID, groupID, chatText);
    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
};

// Hae kaikki viestit tietyltä ryhmältä
export const getGroupMessages = async (req, res, next) => {
  try {
    const { groupID } = req.params;
    const messages = await getGroupChatsByGroup(groupID);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// Poista oma viesti tai ryhmän omistajana muidenkin viestejä
export const removeChatMessage = async (req, res, next) => {
  try {
    const { postID } = req.params;
    const userID = req.user.id;

    const deleted = await deleteGroupChat(postID, userID);
    if (!deleted) throw new ApiError(403, "Ei oikeutta poistaa tätä viestiä");

    res.json({ message: "Viesti poistettu" });
  } catch (err) {
    next(err);
  }
};