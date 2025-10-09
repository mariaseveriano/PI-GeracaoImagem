const mongoose = require('mongoose');

// Schema do Usuário
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
    idade: {
      type: Number,
      min: [0, 'Idade deve ser positiva'],
      max: [150, 'Idade inválida']
    },
    telefone: {
      type: String,
      trim: true
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Cria automaticamente createdAt e updatedAt
    collection: 'users'
  }
);

// Índices para melhor performance
userSchema.index({ email: 1 });
userSchema.index({ nome: 1 });
userSchema.index({ createdAt: -1 });

// Método para formatar o objeto antes de enviar como JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  return user;
};

// Método estático para buscar usuários ativos
userSchema.statics.buscarAtivos = function() {
  return this.find({ ativo: true }).sort({ createdAt: -1 });
};

// Middleware pre-save para logs (opcional)
userSchema.pre('save', function(next) {
  if (this.isNew) {
    console.log(`📝 Novo usuário sendo criado: ${this.email}`);
  }
  next();
});

// Middleware post-save (opcional)
userSchema.post('save', function(doc) {
  console.log(`✅ Usuário salvo: ${doc.email}`);
});

const Users = mongoose.model('User', userSchema);

module.exports = Users;