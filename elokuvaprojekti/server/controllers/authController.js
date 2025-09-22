import User from '../models/User.js'
import { ApiError } from '../helper/ApiError.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Uuden käyttäjän rekisteröinti
export const register = async (req, res, next) => {
    try {
        // Hakee lomakkeelta saadut tiedot
        const { username, email, password } = req.body

        // Tarkistaa onko käyttäjä jo olemassa
        const existingUser = await User.findByEmail(email)
        if (existingUser) {
            throw new ApiError('Email already in use', 409)
        }
        
        await User.create(username, email, password)
        res.status(201).json({ message: 'User registered successfully' })
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
            throw new ApiError('Invalid credentials', 401)
        }

        // Vertailee salasanan tiivistettä
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new ApiError('Invalid credentials', 401)
        }

        // Luo JWT-tokenin
        const token = jwt.sign(
            { id: user.userid, username: user.username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '2h' } // Tokenin voimassaoloaika
        )

        res.status(200).json({ message: 'Login successful', token, username: user.username })
    } catch (error) {
        next(error)
    }
}