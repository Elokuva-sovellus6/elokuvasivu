import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMovieDetails } from '../api/moviedb.jsx';

const API_URL = import.meta.env.VITE_API_URL;

function FavouriteList() {
    const { userId } = useParams();
    const [ data, setData ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ movies, setMovies ] = useState([]);

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const res = await fetch(`${API_URL}/favourites/${userId}/public`);
                const json = await res.json();
                setData(json);

                // Hae elokuvien tiedot
                const movieDetails = await Promise.all(
                    json.favourites.map(async fav => {
                        const details = await getMovieDetails(fav.tmdbId);
                        return { ...details, tmdbId: fav.tmdbId };
                    })
                );
                setMovies(movieDetails);
            } catch (error) {
                console.error('Error fetching favourites:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, [ userId ]);

    if (loading) return <p>Ladataan...</p>;
    if (!data) return <p>Käyttäjää ei löytynyt.</p>;

    return (
        <div>
            <h2>{data.username} suosikit</h2>
            <ul>
                {movies.map(movie => (
                    <li key={movie.tmdbId}>
                        <Link to={`/movie/${movie.tmdbId}`}>
                            {movie.title || `Movie ID: ${movie.tmdbId}`}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FavouriteList;