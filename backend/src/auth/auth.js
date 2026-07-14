import jwt from 'jsonwebtoken';
import knex from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const getContext = async ({ req }) => {
  const authHeader = req.headers.authorization || '';

  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return { currentUser: null };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await knex('users')
      .where({ user_id: decoded.userId })
      .first();

    if (!user) {
      return { currentUser: null };
    }

    return {
      currentUser: {
        id: user.user_id,
        email: user.email,
        role: user.role
      }
    };

  } catch (error) {
    return { currentUser: null };
  }
};