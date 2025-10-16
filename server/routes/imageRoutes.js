// server/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authMiddleware = require('../middleware/authMiddleware');

// Criar job de geração de imagem (autenticado)
router.post('/', authMiddleware, imageController.createJob);

// Consultar status do job
router.get('/:id', authMiddleware, imageController.getJob);

// Servir arquivo gerado (público)
router.get('/download/:filename', imageController.serveGenerated);

module.exports = router;
