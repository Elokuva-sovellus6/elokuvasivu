const BASE_URL = import.meta.env.VITE_API_URL + '/users';

// Hae kirjautuneen käyttäjän tiedot
export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const res = await fetch(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to fetch profile');
  }
  return res.json();
};

// Poista käyttäjäprofiili
export const deleteUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const res = await fetch(`${BASE_URL}/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to delete profile');
  }
  return res.json();
};