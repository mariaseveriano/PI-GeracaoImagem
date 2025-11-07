const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Por favor, forneça um email válido'
      ]
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
    },
    tipo: {
      type: String,
      enum: ['aluno', 'professor'],
      required: true
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Índices
userSchema.index({ email: 1 });
userSchema.index({ nome: 1 });

// NÃO criptografar aqui - deixa o controller fazer
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.senha; // Remove senha do JSON
  return user;
};

const Users = mongoose.model('User', userSchema);

module.exports = Users;