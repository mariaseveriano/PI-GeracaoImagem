const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware opcional (permite uso sem autenticação, mas identifica usuário se estiver logado)
const optionalAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return next(); // Continua sem autenticação
    }

    // Tenta autenticar se token presente
    authMiddleware(req, res, next);
};

// =============== ROTAS DE IMAGENS ===============

router.post('/', optionalAuth, imageController.createJob);

router.get('/', optionalAuth, imageController.listJobs);

router.get('/:id', optionalAuth, imageController.getJob);

router.get('/download/:filename', imageController.serveGenerated);

router.delete('/:id', optionalAuth, imageController.deleteJob);

module.exports = router;