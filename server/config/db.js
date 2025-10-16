const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI não encontrada no arquivo .env');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
    console.log(`📦 Banco de dados: ${mongoose.connection.name}`);

    // Event listeners para monitoramento
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão com MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Desconectado do MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ Reconectado ao MongoDB');
    });

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

const desconectarDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 Desconectado do MongoDB');
  } catch (error) {
    console.error('Erro ao desconectar:', error);
  }
};

module.exports = { conectarDB, desconectarDB };