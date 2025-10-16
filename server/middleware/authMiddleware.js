// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const JWT_SECRET = process.env.JWT_SECRET || 'troque-esta-chave';

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token ausente' });

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // opcionalmente recuperar o usuário para colocar no req.user
    const user = await User.findById(payload.id).select('-senhaHash');
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;
