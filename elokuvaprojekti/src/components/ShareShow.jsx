import { useState } from "react"
import ShareShowModal from "./ShareShowModal.jsx"
import "./style/ShareShow.css"

export default function ShareShow({ show, tmdbId, movieName }) {
  const [shareShow, setShareShow] = useState(null)

  return (
    <>
      <div className="showtime-row">
        <a 
          href={show.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="theatre-link"
        >
          {show.theatre}{show.auditorium ? `, ${show.auditorium}` : ""}
        </a>

        <span className="showtime card-text">
          {new Date(show.time).toLocaleTimeString("fi-FI", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        <button
          className="share-btn"
          onClick={() =>
            setShareShow({ ...show, tmdbId, name: movieName })
          }
        >
          Jaa
        </button>
      </div>

      {shareShow && (
        <ShareShowModal
          showData={shareShow}
          onClose={() => setShareShow(null)}
          onShared={(data) => console.log("Jaettu:", data)}
        />
      )}
    </>
  )
}
