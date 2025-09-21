import User from '../models/User.js';
import { ApiError } from '../helper/ApiError.js';

// Hakee kirjautuneen käyttäjän tiedot
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError('User not found', 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Poistaa kirjautuneen käyttäjän
export const deleteMe = async (req, res, next) => {
  try {
    const deleted = await User.delete(req.user.id);
    if (!deleted) throw new ApiError('User not found', 404);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};