const express = require('express');
const cors = require('cors');
const { conectarDB, desconectarDB } = require('./server/config/db');
const userRoutes = require('./server/routes/userRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: '*', // Em produção, especifique os domínios permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Middleware de log
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api/users', userRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'API de Gerenciamento de Usuários',
    versao: '1.0.0',
    endpoints: {
      users: '/api/users',
      health: '/api/health',
      stats: '/api/users/stats'
    }
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'API funcionando normalmente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'MongoDB Atlas (Mongoose)',
    node: process.version
  });
});

// Rota 404 - Deve vir antes do middleware de erro
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada',
    path: req.path
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro capturado:', err);
  
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Função para iniciar o servidor
const iniciarServidor = async () => {
  try {
    // Conectar ao banco de dados
    await conectarDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 URL: http://localhost:${PORT}`);
      console.log(`🔗 API Users: http://localhost:${PORT}/api/users`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`📊 Stats: http://localhost:${PORT}/api/users/stats`);
      console.log(`🔍 Buscar: http://localhost:${PORT}/api/users/buscar?q=termo`);
      console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de encerramento gracioso
const encerrarGraciosamente = async (sinal) => {
  console.log(`\n⚠️  Sinal ${sinal} recebido. Encerrando servidor...`);
  
  try {
    await desconectarDB();
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => encerrarGraciosamente('SIGINT'));
process.on('SIGTERM', () => encerrarGraciosamente('SIGTERM'));

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
iniciarServidor();

module.exports = app;