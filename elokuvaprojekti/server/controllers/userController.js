import User from '../models/User.js';
import { ApiError } from '../helper/ApiError.js';

// Hakee kirjautuneen käyttäjän tiedot
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) 
      throw new ApiError('Käyttäjää ei löytynyt', 404)
    
    res.json(user)
  } catch (err) {
    next(err)
  }
}

// Poistaa kirjautuneen käyttäjän
export const deleteMe = async (req, res, next) => {
  try {
    const deleted = await User.delete(req.user.id)
    if (!deleted) 
      throw new ApiError('Käyttäjää ei löytynyt', 404)

    res.json({ message: 'Käyttäjä poistettu onnistuneesti' })
  } catch (err) {
    next(err)
  }
}

// Kuvan ja kuvauksen päivitys
export const updateMe = async (req, res, next) => {
  const { userDescription } = req.body
  let userImg = null

  if (req.file && req.file.buffer) {
    const base64 = req.file.buffer.toString('base64')
    const mime = req.file.mimetype
    userImg = `data:${mime};base64,${base64}`
  }

  try {
    const updatedUser = await User.update(req.user.id, userDescription, userImg)
    res.json(updatedUser)
  } catch (err) {
    console.error('Error in updateMe:', err)
    next(err)
  }
}