import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./style/GroupChatForum.css";

export default function GroupChatForum({ groupId, userId, ownerId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // --- Hae viestit tietystä ryhmästä ---
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/groupchat/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Virhe viestien haussa:", err);
    }
  };

  // --- Lähetä uusi viesti ---
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/groupchat`,
        { groupID: groupId, chatText: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      console.error("Virhe viestin lähetyksessä:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Poista viesti ---
  const handleDelete = async (postID) => {
    const confirmed = window.confirm("Haluatko varmasti poistaa tämän viestin?");
    if (!confirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/groupchat/${postID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((m) => m.postid !== postID));
    } catch (err) {
      console.error("Virhe poistossa:", err);
    }
  };


  // --- Hae viestit, kun ryhmä vaihtuu ---
  useEffect(() => {
    fetchMessages();
  }, [groupId]);

  return (
    <section className="forum col-12 col-md-8">
      <h3 className="forum-title">Foorumi</h3>

      {/* --- Viestilista --- */}
      <div className="forum-messages mb-3 p-3">
        {messages.length === 0 ? (
          <p className="text-muted text-center">
            Ei vielä viestejä. Aloita keskustelu!
          </p>
        ) : (
          messages.map((msg) => {
            const canDelete =
              String(userId) === String(msg.userid) ||
              (ownerId && String(userId) === String(ownerId));

            const profileImg = msg.userimg || "/placeholder_profile.png";

            return (
              <div key={msg.postid} className="forum-message mb-3 p-3 rounded">
                <div className="d-flex align-items-center mb-2">
                  {/* Profiilikuva */}
                  <img
                    src={msg.userimg || "/placeholder_profile.png"}
                    alt={`${msg.username} profiilikuva`}
                    className="chat-avatar me-2"
                  />

                  {/* Käyttäjänimi ja aika */}
                  <div className="flex-grow-1">
                    <strong className="forum-username">{msg.username}</strong>
                    <small className="forum-date ms-2">
                      {new Date(msg.postdate).toLocaleString("fi-FI")}
                    </small>
                  </div>

                  {/* Poista-nappi oikeaan reunaan */}
                  {canDelete && (
                    <button
                      className="delete-btn btn-sm ms-auto"
                      onClick={() => handleDelete(msg.postid)}
                      title="Poista viesti"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  )}
                </div>

                <p className="forum-text">{msg.chattext}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Viestin kirjoitus --- */}
      <div className="forum-input">
        <textarea
          className="form-control mb-2 forum-textarea"
          placeholder="Kirjoita viesti..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
        />
        <button
          className="btn btn-primary w-100 send-btn"
          onClick={handleSendMessage}
          disabled={loading}
        >
          {loading ? "Lähetetään..." : "Lähetä"}
        </button>
      </div>
    </section>
  );
}