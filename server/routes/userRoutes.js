const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rotas de usuários
router.get('/stats', userController.estatisticas);
router.get('/buscar', userController.buscar);
router.get('/', userController.listarTodos);
router.get('/:id', userController.buscarPorId);
router.post('/', userController.criar);
router.put('/:id', userController.atualizar);
router.patch('/:id/toggle', userController.toggleAtivo);
router.delete('/:id', userController.deletar);

module.exports = router;