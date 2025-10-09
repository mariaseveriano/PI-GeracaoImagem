const Users = require('../models/Users');

const userController = {
  // GET /api/users - Listar todos os usuários
  listarTodos: async (req, res) => {
    try {
      const { ativo, page = 1, limit = 10 } = req.query;
      
      // Filtros opcionais
      const filtro = {};
      if (ativo !== undefined) {
        filtro.ativo = ativo === 'true';
      }

      // Paginação
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const users = await Users
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Users.countDocuments(filtro);

      res.status(200).json({
        sucesso: true,
        total,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(total / parseInt(limit)),
        dados: users
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar usuários',
        erro: error.message
      });
    }
  },

  // GET /api/users/:id - Buscar usuário por ID
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await Users.findById(id);

      if (!user) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        sucesso: true,
        dados: user
      });
    } catch (error) {
      const status = error.name === 'CastError' ? 400 : 500;
      res.status(status).json({
        sucesso: false,
        mensagem: error.name === 'CastError' ? 'ID inválido' : 'Erro ao buscar usuário',
        erro: error.message
      });
    }
  },

  // POST /api/users - Criar novo usuário
  criar: async (req, res) => {
    try {
      const { nome, email, idade, telefone } = req.body;

      // Verifica se email já existe
      const emailExiste = await Users.findOne({ email });
      if (emailExiste) {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'Email já cadastrado'
        });
      }

      const novoUsuario = new Users({
        nome,
        email,
        idade,
        telefone
      });

      await novoUsuario.save();

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário criado com sucesso',
        dados: novoUsuario
      });
    } catch (error) {
      // Erros de validação do Mongoose
      if (error.name === 'ValidationError') {
        const erros = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Erro de validação',
          erros
        });
      }

      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar usuário',
        erro: error.message
      });
    }
  },

  // PUT /api/users/:id - Atualizar usuário
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, idade, telefone, ativo } = req.body;

      // Verifica se está tentando mudar para um email já existente
      if (email) {
        const emailExiste = await Users.findOne({ 
          email, 
          _id: { $ne: id } 
        });
        
        if (emailExiste) {
          return res.status(409).json({
            sucesso: false,
            mensagem: 'Email já está em uso por outro usuário'
          });
        }
      }

      const userAtualizado = await Users.findByIdAndUpdate(
        id,
        { nome, email, idade, telefone, ativo },
        { 
          new: true, // Retorna o documento atualizado
          runValidators: true // Executa validações do schema
        }
      );

      if (!userAtualizado) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Usuário atualizado com sucesso',
        dados: userAtualizado
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const erros = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Erro de validação',
          erros
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'ID inválido'
        });
      }

      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar usuário',
        erro: error.message
      });
    }
  },

  // DELETE /api/users/:id - Deletar usuário
  deletar: async (req, res) => {
    try {
      const { id } = req.params;

      const userDeletado = await Users.findByIdAndDelete(id);

      if (!userDeletado) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Usuário deletado com sucesso',
        dados: userDeletado
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'ID inválido'
        });
      }

      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao deletar usuário',
        erro: error.message
      });
    }
  },

  // PATCH /api/users/:id/toggle - Ativar/Desativar usuário
  toggleAtivo: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await Users.findById(id);

      if (!user) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      user.ativo = !user.ativo;
      await user.save();

      res.status(200).json({
        sucesso: true,
        mensagem: `Usuário ${user.ativo ? 'ativado' : 'desativado'} com sucesso`,
        dados: user
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao alterar status do usuário',
        erro: error.message
      });
    }
  },

  // GET /api/users/stats - Estatísticas
  estatisticas: async (req, res) => {
    try {
      const total = await Users.countDocuments();
      const ativos = await Users.countDocuments({ ativo: true });
      const inativos = await Users.countDocuments({ ativo: false });

      // Média de idade (apenas usuários com idade definida)
      const usuariosComIdade = await Users.find({ idade: { $exists: true, $ne: null } });
      const mediaIdade = usuariosComIdade.length > 0
        ? usuariosComIdade.reduce((acc, user) => acc + user.idade, 0) / usuariosComIdade.length
        : 0;

      res.status(200).json({
        sucesso: true,
        dados: {
          totalUsuarios: total,
          usuariosAtivos: ativos,
          usuariosInativos: inativos,
          mediaIdade: mediaIdade.toFixed(1)
        }
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar estatísticas',
        erro: error.message
      });
    }
  },

  // GET /api/users/buscar?q=termo - Buscar usuários
  buscar: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Parâmetro de busca (q) é obrigatório'
        });
      }

      const users = await Users.find({
        $or: [
          { nome: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 });

      res.status(200).json({
        sucesso: true,
        total: users.length,
        dados: users
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar usuários',
        erro: error.message
      });
    }
  }
};

module.exports = userController;