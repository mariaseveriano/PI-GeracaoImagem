const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// GET /api/config/apikey - Retorna a API key do Hugging Face
router.get('/apikey', verificarToken, (req, res) => {
    try {
        const apiKey = process.env.HUGGINGFACE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'API key não configurada no servidor'
            });
        }

        res.json({
            apiKey: apiKey
        });
    } catch (error) {
        console.error('Erro ao buscar API key:', error);
        res.status(500).json({
            error: 'Erro ao buscar configurações'
        });
    }
});

module.exports = router;