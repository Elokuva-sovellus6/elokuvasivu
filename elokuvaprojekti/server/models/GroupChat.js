import { pool } from "../helper/db.js";

// Luo uusi viesti
export const createGroupChat = async (userID, groupID, chatText) => {
  const result = await pool.query(
    `INSERT INTO GroupChat (userID, groupID, chatText)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userID, groupID, chatText]
  );
  return result.rows[0];
};

// Hae ryhmän kaikki viestit (uusin ensin)
export const getGroupChatsByGroup = async (groupID) => {
  const result = await pool.query(
    `
    SELECT 
      g.postid,
      g.userid,
      g.groupid,
      g.chattext,
      g.postdate,
      u.username,
      u.userimg
    FROM groupchat g
    JOIN users u ON g.userid = u.userid
    WHERE g.groupid = $1
    ORDER BY g.postdate DESC
    `,
    [groupID]
  );
  return result.rows;
};

// Hae ryhmän omistaja
export const getGroupOwner = async (groupID) => {
  const result = await pool.query(
    `SELECT ownerID FROM Groups WHERE groupID = $1`,
    [groupID]
  );
  return result.rows[0]?.ownerid || null;
};

// Poista viesti (omistaja tai viestin kirjoittaja)
export const deleteGroupChat = async (postID, userID) => {
  const result = await pool.query(
    `
    DELETE FROM GroupChat
    WHERE postID = $1
      AND (
        userID = $2
        OR $2 IN (SELECT ownerID FROM Groups WHERE groupID = GroupChat.groupID)
      )
    RETURNING *;
    `,
    [postID, userID]
  );

  return result.rows[0];
};