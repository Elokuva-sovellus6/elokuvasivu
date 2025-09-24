import  { useContext } from 'react'
import { AuthContext } from '../context/authContext.js'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext)
  if (!isLoggedIn) {
    return <Navigate to="/" />
  }
  return children
}