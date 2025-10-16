const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Users = require('../models/Users');

// Rotas de usuários
router.get('/stats', userController.estatisticas);
router.get('/buscar', userController.buscar);
router.get('/', userController.listarTodos);
router.get('/:id', userController.buscarPorId);
router.post('/', userController.criar);
router.put('/:id', userController.atualizar);
router.patch('/:id/toggle', userController.toggleAtivo);
router.delete('/:id', userController.deletar);

// Cadastro de usuário
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, idade, telefone } = req.body;
    console.log('Recebido para cadastro:', { email, senha }); // Apenas para teste
    const novoUsuario = new Users({ nome, email, senha, idade, telefone });
    await novoUsuario.save();
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

module.exports = router;