import React, { useState } from "react"
import "./style/Rating.css"
import axios from "axios"

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
        `${process.env.REACT_APP_API_URL}/movies/${movieId}/review`,
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

  const numericRating = parseFloat(rateFormData.rating) || 0

  const fullStars = Math.floor(numericRating)
  const halfStars = numericRating % 1 >= 0.5 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStars

  const stars = []
  for (let i = 0; i < fullStars; i++) stars.push(<span key={"f" + i} className="filled">★</span>)
  for (let i = 0; i < halfStars; i++) stars.push(<span key={"h" + i} className="half">★</span>)
  for (let i = 0; i < emptyStars; i++) stars.push(<span key={"e" + i} className="empty">★</span>)

  return (
    <div className="rating-card">
      <h4 className="mb-3">Arvostele tämä elokuva</h4>
      <div className="stars mb-3">{stars}</div>
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
      <div className="submit_rating">
        <button className="btn btn-success" onClick={handleRateSubmit}>Arvostele</button>
      </div>
    </div>
  )
}