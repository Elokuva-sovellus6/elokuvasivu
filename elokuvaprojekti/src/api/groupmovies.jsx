import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Lisää uusi elokuvajako
export const addGroupMovie = async (payload, token) => {
  const res = await axios.post(`${API_URL}/groupmovies`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Hae kaikki jaot tietystä ryhmästä
export const getGroupMovies = async (groupID, token) => {
  const res = await axios.get(`${API_URL}/groupmovies/${groupID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Poista elokuvajako
export const deleteGroupMovie = async (shareID, token) => {
  const res = await axios.delete(`${API_URL}/groupmovies/${shareID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};