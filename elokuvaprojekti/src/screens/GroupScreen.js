import './GroupScreen.css';

export default function GroupScreen() {
  return (
    <div className='groupscreen'>

        {/*Logo ja hakupalkki, kirjautuminen puuttuu*/}
      <header className="topbar">
        <div className="logo-placeholder">Logo</div>
        <div className="search">
          <input type="text" placeholder="Hae..." />
        </div>
      </header>

      {/*Ryhmän tiedot*/}
      <section className='group-header'>
        <div className='group-image'></div>
        <div className='group-info'>
          <h1>Ryhmän nimi</h1>
          <p>Ryhmän kuvausteksti</p>
        </div>
      </section>

      {/*Ryhmän suosikkielokuvat*/}
      <section className="favourites">
        <h2>Ryhmän suosikkielokuvat</h2>
        <div className="favourite-list">
          <div className="movie-card">
            <div className="movie-image"></div>
            <div className="movie-title">Elokuva 1</div>
          </div>
          <div className="movie-card">
            <div className="movie-image"></div>
            <div className="movie-title">Elokuva 2</div>
          </div>
          <div className="movie-card">
            <div className="movie-image"></div>
            <div className="movie-title">Elokuva 3</div>
          </div>
        </div>
      </section>

      <div className='middle-content'>

        {/*Foorumi*/}
        <section className='forum'>
          <h2>Foorumi</h2>
          <div className='forum-messages'>Foorumi</div>
          <textarea placeholder='Kirjoita viesti'></textarea>
          <button>Lähetä</button>
        </section>

        {/*Jäsenet*/}
        <section className='members'>
          <h2>Ryhmän jäsenet</h2>
          <div className='member-list'>Jäsenet</div>
          <input type='text' placeholder='Lisää jäsen'/>
          <button>Lähetä liittymispyyntö</button>
        </section>
      </div>

      <footer className='footer'>
        Elokuvasovellus
      </footer>
    </div>
  );
}