import React, { useState } from "react";
import "./style/Rating.css";
import axios from "axios";
import RatingStars from "./RatingStars.jsx";

export default function Rating({ movieId, token }) {
  const [rateFormData, setRateFormData] = useState({
    rating: "",
    review: ""
  })

  const handleRateSubmit = async (e) => {
    e.preventDefault()
    // Varmistaa että käyttäjä on kirjautunut sisään ennen arvostelun lähettämistä
    if (!token) {
      console.error("Kirjaudu jättääksesi arvostelu")
      return
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/movies/${movieId}/review`,
        {
          rating: parseFloat(rateFormData.rating),
          review: rateFormData.review,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log("Arvostelu jätetty:", response.data)
      setRateFormData({ rating: "", review: "" })
    } catch (err) {
      console.error("Virhe arvostelua jättäessä:", err.response?.data || err.message)
    }
  }

  const currentRating = rateFormData.rating
  
  return (
    <div className="rating-card">
      <h4 className="mb-3">Arvostele tämä elokuva</h4>
      
      <RatingStars rating={currentRating} />
      
      <input
        type="number"
        className="mb-3"
        placeholder="Tähtien määrä..."
        step="0.5"
        min="0"
        max="5"
        value={rateFormData.rating}
        onChange={(e) => {
          let value = e.target.value
          if (value === "") {
            setRateFormData({ ...rateFormData, rating: "" })
            return
          }
          value = parseFloat(value)
          if (isNaN(value) || value < 0) value = 0
          if (value > 5) value = 5
          setRateFormData({ ...rateFormData, rating: value.toString() })
        }}
      />
      <div className="write_rating mb-3">
        <textarea
          className="form-control"
          rows="6"
          placeholder="Kirjoita arvostelu..."
          value={rateFormData.review}
          onChange={(e) => setRateFormData({ ...rateFormData, review: e.target.value })}
        />
      </div>
      <div className="d-grid mt-3">
        <button className="btn" onClick={handleRateSubmit}>Arvostele</button>
      </div>
    </div>
  )
}