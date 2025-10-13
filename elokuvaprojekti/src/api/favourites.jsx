const BASE_URL = import.meta.env.VITE_API_URL + '/favourites';

//Lisää elokuva suosikkeihin
export const addFavourite = async (tmdbId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const res = await fetch(`${BASE_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tmdbId }),
  });

  if (!res.ok) throw new Error('Failed to add favourite');
  return res.json();
};

//Poista elokuva suosikeista
export const removeFavourite = async (tmdbId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const res = await fetch(`${BASE_URL}/${tmdbId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to remove favourite');
  return res.json();
};

//Hae käyttäjän suosikit
export const getFavourites = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch favourites');
  return res.json();
};