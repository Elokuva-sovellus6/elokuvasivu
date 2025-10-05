import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";


export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [token, setToken] = useState(null)

  // Tallentaa tokenin ja käyttäjätiedot
  const login = (token, name) => {
    const decoded = jwtDecode(token)
    const expiration = decoded.exp * 1000

    setToken(token)
    setUsername(name)
    setIsLoggedIn(true)

    localStorage.setItem('token', token)
    localStorage.setItem('username', name)
    localStorage.setItem('exp', expiration)

    // Aloittaa automaattisen uloskirjautumisen ajastimen
    scheduleLogout(expiration)
  }

  // Poistaa tokenin ja käyttäjätiedot
  const logout = () => {
    setToken(null)
    setUsername('')
    setIsLoggedIn(false)
    localStorage.clear()
  }

  // Aikatauluttaa automaattisen uloskirjautumisen
  const scheduleLogout = (expiration) => {
    const timeLeft = expiration - Date.now()
      if (timeLeft > 0) {
      setTimeout(() => {
        logout()
      }, timeLeft)
    } else {
      logout()
    }
  }

  // Tarkistaa onko käyttäjä jo kirjautunut sisään
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')
    const storedExp = localStorage.getItem('exp')

    // Jos token on voimassa, asettaa käyttäjän tilan
    if (storedToken && storedUsername && storedExp) {
     if (Date.now() < parseInt(storedExp, 10)) {
        setToken(storedToken)
        setUsername(storedUsername)
        setIsLoggedIn(true)
        scheduleLogout(parseInt(storedExp, 10))
      } else {
        logout()
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  )
}