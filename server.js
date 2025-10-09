const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// "Banco de dados" simples em memória
const usuarios = [];

// Chave secreta para JWT
const JWT_SECRET = 'sua_chave_secreta_super_segura';

// Endpoint de registro
app.post('/api/auth/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const existe = usuarios.find(u => u.email === email);
    if (existe) {
        return res.status(400).json({ error: 'Usuário já existe' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = { id: usuarios.length + 1, nome, email, senha: senhaHash };
    usuarios.push(usuario);

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Endpoint de login
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
        return res.status(400).json({ error: 'Erro ao efetuar login' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
        return res.status(400).json({ error: 'Erro ao efetuar login' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Exemplo de rota protegida
app.get('/api/protected', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: `Olá ${decoded.email}, você acessou rota protegida!` });
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
