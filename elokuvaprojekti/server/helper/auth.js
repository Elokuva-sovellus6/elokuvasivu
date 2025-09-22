import jwt from 'jsonwebtoken';
import { ApiError } from '../helper/ApiError.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next(new ApiError('No token provided', 401))
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) return next(new ApiError('Invalid or expired token', 403))
    req.user = decoded;
    next()
  })
}