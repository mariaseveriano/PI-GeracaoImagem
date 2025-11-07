require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const Users = require('./server/models/Users');

const app = express();
const PORT = 3000;

// Middlewares
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static(__dirname + '/public'));


// CONEXÃO ÚNICA COM MONGODB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado ao MongoDB Atlas');
        console.log('📦 Banco:', mongoose.connection.name);
        console.log('-------------');
    })
    .catch((err) => {
        console.error('❌ Erro ao conectar:', err.message);
        process.exit(1);
    });

// ENDPOINT DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;

        // Validação
        if (!nome || !email || !senha) {
            return res.status(400).json({
                error: 'Nome, email e senha são obrigatórios'
            });
        }

        // Verifica se já existe
        const existe = await Users.findOne({ email });
        if (existe) {
            return res.status(400).json({
                error: 'Email já cadastrado'
            });
        }

        // Criptografa a senha AQUI (não no model)
        const senhaHash = await bcrypt.hash(senha, 10);

        // Cria o usuário
        const novoUsuario = new Users({
            nome,
            email,
            senha: senhaHash, // Salva a senha criptografada
            tipo: tipo || 'usuario'
        });

        await novoUsuario.save();

        console.log(`-------------`);
        console.log(`✅ Novo usuário registrado`);
        console.log(`Nome: ${nome}`);
        console.log(`Email: ${email}`);
        console.log(`Tipo: ${tipo || 'usuario'}`);
        console.log(`-------------`);

        // Gera o token
        const token = jwt.sign(
            {
                id: novoUsuario._id,
                email: novoUsuario.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            usuario: {
                id: novoUsuario._id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                tipo: novoUsuario.tipo
            }
        });

    } catch (err) {
        console.error('❌ Erro no registro:', err);
        res.status(500).json({
            error: 'Erro ao cadastrar usuário',
            detalhes: err.message
        });
    }
});

// ENDPOINT DE LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        console.log('🔐 Tentativa de login:', email);

        // Validação
        if (!email || !senha) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios'
            });
        }

        // Busca o usuário
        const usuario = await Users.findOne({ email });

        if (!usuario) {
            console.log('❌ Usuário não encontrado');
            return res.status(400).json({
                error: 'Email ou senha incorretos'
            });
        }

        // Compara a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            console.log('❌ Senha incorreta');
            return res.status(400).json({
                error: 'Email ou senha incorretos'
            });
        }

        console.log('✅ Login bem-sucedido:', email);

        // Gera o token
        const token = jwt.sign(
            {
                id: usuario._id,
                email: usuario.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });

    } catch (err) {
        console.error('❌ Erro no login:', err);
        res.status(500).json({
            error: 'Erro ao fazer login',
            detalhes: err.message
        });
    }
});

// ROTA PROTEGIDA (EXEMPLO)
app.get('/api/protected', (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            error: 'Token não fornecido'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            message: `Olá ${decoded.email}, você acessou uma rota protegida!`,
            usuario: decoded
        });
    } catch {
        res.status(401).json({
            error: 'Token inválido ou expirado'
        });
    }
});

// ROTAS DE USUÁRIOS (CRUD)
const userRoutes = require('./server/routes/userRoutes');
app.use('/api/users', userRoutes);

// ROTAS DE HISTÓRICO
const historyRoutes = require('./server/routes/historyRoutes');
app.use('/api/history', historyRoutes);

// ROTAS DE CONFIGURAÇÃO (NOVA!)
const configRoutes = require('./server/routes/configRoutes');
app.use('/api/config', configRoutes);

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log('-------------');
    console.log('📋 Rotas disponíveis:');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/config/apikey');
    console.log('   GET    /api/history');
    console.log('   POST   /api/history');
    console.log('   GET    /api/history/:id');
    console.log('   DELETE /api/history/:id');
    console.log('   DELETE /api/history');
    console.log('-------------');
});