const BASE_URL = import.meta.env.VITE_API_URL + '/movies';

// Hae elokuvan arvostelut
export const getReviews = async (movieId) => {
  const res = await fetch(`${BASE_URL}/${movieId}/review`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to fetch reviews')
  }
  return res.json()
}

// Lisää arvostelu (kirjautuneelle käyttäjälle)
export const createReview = async (movieId, rating, reviewText) => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No token found')

  const res = await fetch(`${BASE_URL}/${movieId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, review: reviewText }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to create review')
  }
  return res.json()
}

// Hae käyttäjän kaikki arvostelut
export const getUserReviews = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/${userId}/reviews`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to fetch user reviews')
  }
  return res.json()
}

// Hae 10 viimeisintä arvostelua
export const getLatestReviews = async () => {
  const res = await fetch(`${BASE_URL}/reviews/latest`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch latest reviews");
  }
  return res.json();
};

// Poista arvostelu
export const deleteReview = async (reviewId) => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No token found')

  const res = await fetch(`${BASE_URL}/review/${reviewId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to delete review')
  }
  return res.json()
}