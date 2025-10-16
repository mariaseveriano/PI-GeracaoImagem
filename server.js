const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRoutes = require('./server/routes/userRoutes');
const Users = require('./server/models/Users');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + '/public'));

// Conexão única com o MongoDB Atlas
mongoose.connect('mongodb+srv://tes:DizzY2526@test.dbjtdk5.mongodb.net/pictura?retryWrites=true&w=majority&appName=test')
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas\n-------------');
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
  });

// Chave secreta para JWT
const JWT_SECRET = 'sua_chave_secreta_super_segura';

// Endpoint de registro
app.post('/api/auth/register', async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    try {
        const existe = await Users.findOne({ email });
        if (existe) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const novoUsuario = new Users({ nome, email, senha: senhaHash, tipo });
        await novoUsuario.save();
        console.log(`-------------\nNovo Usuário Registrado no BD\nNome: ${nome}\nEmail: ${email}\nSenha: ${senha}\nTipo: ${tipo}\n-------------`);

        const token = jwt.sign({ id: novoUsuario._id, email: novoUsuario.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
});

// Endpoint de login
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Tentativa de login:');
    console.log('Email recebido:', email);
    console.log('Senha recebida:', senha);
    if (!email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    const usuario = await Users.findOne({ email });
    console.log('Usuário encontrado:', usuario ? usuario.email : 'Nenhum');
    console.log('Senha salva no banco:', usuario ? usuario.senha : 'Nenhum');
    if (!usuario) {
        return res.status(400).json({ error: 'Erro ao efetuar login' });
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('Senha válida?', senhaValida);
    if (!senhaValida) {
        return res.status(400).json({ error: 'Erro ao efetuar login' });
    }
    const token = jwt.sign({ id: usuario._id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    if (usuario) {
        console.log('Senha original cadastrada:', senha);
    }
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

app.use('/api', userRoutes);

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
