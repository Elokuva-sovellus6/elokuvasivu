const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

// Haetaan elokuvat TMDB:stä hakusanalla ja sivulla
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&include_adult=false&language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`TMDB error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      totalPages: data.total_pages || 0
    };
  } catch (err) {
    console.error("Virhe haussa:", err);
    return { results: [], totalPages: 0 };
  }
}

// Käytetään tätä defaultin hakuna, jos hakukenttä on tyhjä
export const getPopularMovies = async (page = 1) => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  const data = await response.json();
  return {
    results: data.results,
    totalPages: data.total_pages
  };
};

