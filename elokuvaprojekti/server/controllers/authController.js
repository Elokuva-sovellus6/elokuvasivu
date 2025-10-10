import User from '../models/User.js'
import { ApiError } from '../helper/ApiError.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Uuden käyttäjän rekisteröinti
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    // Tarkista onko käyttäjä jo olemassa
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      throw new ApiError('Tämä sähköposti on jo käytössä', 409)
    }

    // Salasanan validointi (min 8 merkkiä, iso kirjain, numero)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    const trimmedPassword = password.trim()

    if (!passwordRegex.test(trimmedPassword)) {
        throw new ApiError('Salasanan tulee olla vähintään 8 merkkiä pitkä ja sisältää ainakin yhden ison kirjaimen sekä numeron.', 400)
    }

    // Käytä trimmattua salasanaa käyttäjän luontiin
    await User.create(username, email, trimmedPassword) 
    res.status(201).json({ message: 'Rekisteröityminen onnistui' })
  } catch (error) {
    next(error)
  }
}

// Käyttäjän kirjautuminen
export const login = async (req, res, next) => {
    try {
        // Hakee lomakkeelta saadut tiedot
        const { email, password } = req.body

        // Hakee käyttäjän tietokannasta sähköpostin perusteella
        const user = await User.findByEmail(email);
        if (!user) {
            throw new ApiError('Väärä sähköposti tai salasana', 401)
        }

        // Vertailee salasanan tiivistettä
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new ApiError('Väärä sähköposti tai salasana', 401)
        }

        // Luo JWT-tokenin
        const token = jwt.sign(
            { id: user.userid, username: user.username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '2h' } // Tokenin voimassaoloaika
        )

        res.status(200).json({ message: 'Kirjautuminen onnistui', token, username: user.username })
    } catch (error) {
        next(error)
    }
}

export const signout = (req, res, next) => {
    res.status(204).send()
}