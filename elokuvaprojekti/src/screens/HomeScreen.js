//Näyttää elokuvia, arvosteluita ja ryhmiä
export default function HomeScreen() {
    const HomeMovies = [
        {
            id: 1,
            title: "Elokuva 1",
            description: "Kuvaus elokuvasta 1",
            image: "x",
            stars: "★★★★★",
        },
        {
            id: 2,
            title: "Elokuva 2",
            description: "Kuvaus elokuvasta 2",
            image: "x",
            stars: "★★★★★",
        },
        {
            id: 3,
            title: "Elokuva 3",
            description: "Kuvaus elokuvasta 3",
            image: "x",
            stars: "★★★★★",
        },
    ];

    const HomeReviews = [
        { id: 1, user: "Käyttäjä1", text:"Suosituin arvostelu", stars: "★★★★★"},
        { id: 2, user: "Käyttäjä2", text:"Suosituin arvostelu", stars: "★★★★★"},
        { id: 3, user: "Käyttäjä3", text:"Suosituin arvostelu", stars: "★★★★★"},
    ];

    const HomeGroups = [
        "Ryhmä1", "Ryhmä2", "Ryhmä3", "Ryhmä4",
    ];

    
  return (
    <div className="container mt-4">
      <h3>Elokuvat</h3>
      <div className="row">
        {HomeMovies.map((movie) => (
          <div className="col-md-4 mb-4" key={movie.id}>
            <div className="card h-100 shadow-sm">
              <div
              //Näyttää kuvan harmaana placeholder laatikkona
                className="card-img-top"
                style={{
                  backgroundColor: "#ccc",
                  width: "100%",
                  height: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  color: "#555"
                }}
              >
                {movie.image === "x" ? "Placeholder" : <img src={movie.image} alt={movie.title} style={{width: "100%", height: "100%", objectFit: "cover"}} />}
              </div>
              
              <div className="card-body">
                <h5 className="card-title">{movie.title}</h5>
                <div>{movie.stars}</div>
                <p className="card-text">{movie.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-5">Arvostelut</h3>
      <div className="row">
        {HomeReviews.map((review) => (
          <div className="col-md-4 mb-4" key={review.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">{review.user}</h6>
                <p className="card-text">{review.text}</p>
                <div>{review.stars}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-5">Ryhmät</h3>
      <div className="card p-3">
        <ul className="list-unstyled mb-0">
          {HomeGroups.map((group, idx) => (
            <li key={idx}>{group}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}