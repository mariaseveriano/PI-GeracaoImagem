const Users = require('../models/Users');
const bcrypt = require('bcrypt');

const userController = {
  // GET /api/users - Listar todos os usuários
  listarTodos: async (req, res) => {
    try {
      const { ativo, tipo, page = 1, limit = 10 } = req.query;

      // Filtros opcionais
      const filtro = {};
      if (ativo !== undefined) {
        filtro.ativo = ativo === 'true';
      }
      if (tipo) {
        filtro.tipo = tipo;
      }

      // Paginação
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const users = await Users
        .find(filtro)
        .select('-senha') // Não retornar senha
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
      console.error('Erro ao listar usuários:', error);
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

      const user = await Users.findById(id).select('-senha');

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

  // POST /api/users - Criar novo usuário (NÃO USAR - Use /api/auth/register)
  criar: async (req, res) => {
    try {
      const { nome, email, senha, tipo, idade, telefone } = req.body;

      // Validação básica
      if (!nome || !email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nome, email e senha são obrigatórios'
        });
      }

      // Verifica se email já existe
      const emailExiste = await Users.findOne({ email });
      if (emailExiste) {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'Email já cadastrado'
        });
      }

      // Criptografa a senha
      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = new Users({
        nome,
        email,
        senha: senhaHash,
        tipo: tipo || 'aluno',
      });

      await novoUsuario.save();

      // Remove senha do retorno
      const userResponse = novoUsuario.toObject();
      delete userResponse.senha;

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário criado com sucesso',
        dados: userResponse
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);

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
      const { nome, email, senha, ativo, tipo } = req.body;

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

      // Prepara dados para atualização
      const dadosAtualizacao = {};
      if (nome) dadosAtualizacao.nome = nome;
      if (email) dadosAtualizacao.email = email;
      if (ativo !== undefined) dadosAtualizacao.ativo = ativo;
      if (tipo) dadosAtualizacao.tipo = tipo;

      // Se senha foi fornecida, criptografa
      if (senha) {
        dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
      }

      const userAtualizado = await Users.findByIdAndUpdate(
        id,
        dadosAtualizacao,
        {
          new: true,
          runValidators: true
        }
      ).select('-senha');

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
      console.error('Erro ao atualizar usuário:', error);

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

      const userDeletado = await Users.findByIdAndDelete(id).select('-senha');

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
      console.error('Erro ao deletar usuário:', error);

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

      // Remove senha do retorno
      const userResponse = user.toObject();
      delete userResponse.senha;

      res.status(200).json({
        sucesso: true,
        mensagem: `Usuário ${user.ativo ? 'ativado' : 'desativado'} com sucesso`,
        dados: userResponse
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
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
      const professores = await Users.countDocuments({ tipo: 'professor' });
      const alunos = await Users.countDocuments({ tipo: 'aluno' });

      // Média de idade (apenas usuários com idade definida)
      const usuariosComIdade = await Users.find({
        idade: { $exists: true, $ne: null }
      }).select('idade');

      const mediaIdade = usuariosComIdade.length > 0
        ? usuariosComIdade.reduce((acc, user) => acc + user.idade, 0) / usuariosComIdade.length
        : 0;

      res.status(200).json({
        sucesso: true,
        dados: {
          totalUsuarios: total,
          usuariosAtivos: ativos,
          usuariosInativos: inativos,
          professores,
          alunos,
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
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
      const { q, tipo } = req.query;

      if (!q) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Parâmetro de busca (q) é obrigatório'
        });
      }

      const filtro = {
        $or: [
          { nome: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      };

      if (tipo) {
        filtro.tipo = tipo;
      }

      const users = await Users
        .find(filtro)
        .select('-senha')
        .sort({ createdAt: -1 });

      res.status(200).json({
        sucesso: true,
        total: users.length,
        dados: users
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar usuários',
        erro: error.message
      });
    }
  },

  // PATCH /api/users/:id/password - Alterar senha
  alterarSenha: async (req, res) => {
    try {
      const { id } = req.params;
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Senha atual e nova senha são obrigatórias'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nova senha deve ter no mínimo 6 caracteres'
        });
      }

      const user = await Users.findById(id);

      if (!user) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      // Verifica senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, user.senha);

      if (!senhaValida) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Senha atual incorreta'
        });
      }

      // Atualiza senha
      user.senha = await bcrypt.hash(novaSenha, 10);
      await user.save();

      res.status(200).json({
        sucesso: true,
        mensagem: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao alterar senha',
        erro: error.message
      });
    }
  }
};

module.exports = userController;