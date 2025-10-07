import "./style/Rating.css";

export default function RatingStars({ rating }) {
  const numericRating = parseFloat(rating) || 0
  const fullStars = Math.floor(numericRating)
  const halfStars = numericRating % 1 >= 0.5 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStars
  const stars = []

  // Täydet tähdet
  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`f${i}`} className="filled">★</span>)
  }
  // Puolikkaat tähdet
  for (let i = 0; i < halfStars; i++) {
    stars.push(<span key={`h${i}`} className="half">★</span>)
  }
  // Tyhjät tähdet
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`e${i}`} className="empty">★</span>)
  }

  return <span className="stars">{stars}</span>
}