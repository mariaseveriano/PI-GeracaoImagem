// server/controllers/authController.js
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque-esta-chave';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

function gerarToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });

    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: 'Email já cadastrado' });

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const user = new User({ nome, email, senhaHash });
    await user.save();

    const token = gerarToken(user);
    const out = user.toObject(); delete out.senhaHash;

    res.status(201).json({ token, user: out });
  } catch (err) {
    console.error('auth.register', err);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'email e senha são obrigatórios' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok) return res.status(400).json({ error: 'Credenciais inválidas' });

    const token = gerarToken(user);
    const out = user.toObject(); delete out.senhaHash;

    res.json({ token, user: out });
  } catch (err) {
    console.error('auth.login', err);
    res.status(500).json({ error: 'Erro ao efetuar login' });
  }
};
