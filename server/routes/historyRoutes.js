const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const History = require('../models/History');
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

// POST /api/history - Salvar nova geração no histórico
router.post('/', verificarToken, async (req, res) => {
    try {
        const { materia, conteudo, estilo, infoAdicional, prompt, imageUrl, imageData, status, errorMessage, duration } = req.body;

        const novoHistorico = new History({
            userId: req.userId,
            materia,
            conteudo,
            estilo,
            infoAdicional: infoAdicional || '',
            prompt,
            imageUrl,
            imageData,
            status: status || 'success',
            errorMessage,
            duration
        });

        await novoHistorico.save();

        res.status(201).json({
            success: true,
            message: 'Histórico salvo com sucesso',
            data: novoHistorico
        });
    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao salvar no histórico',
            details: error.message
        });
    }
});

// GET /api/history - Buscar histórico do usuário
router.get('/', verificarToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, materia, conteudo } = req.query;

        // Construir filtro
        const filtro = { userId: req.userId };
        if (materia) filtro.materia = materia;
        if (conteudo) filtro.conteudo = conteudo;

        // Paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // MUDANÇA: Agora retornamos o imageData também na listagem
        const historico = await History
            .find(filtro)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        // Removemos o .select('-imageData') para incluir o base64

        const total = await History.countDocuments(filtro);

        res.json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: historico
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar histórico',
            details: error.message
        });
    }
});

// GET /api/history/:id - Buscar item específico do histórico
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const item = await History.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item não encontrado'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Erro ao buscar item:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar item',
            details: error.message
        });
    }
});

// DELETE /api/history/:id - Deletar item do histórico
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const item = await History.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Item deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao deletar item',
            details: error.message
        });
    }
});

// DELETE /api/history - Limpar todo histórico do usuário
router.delete('/', verificarToken, async (req, res) => {
    try {
        const result = await History.deleteMany({ userId: req.userId });

        res.json({
            success: true,
            message: `${result.deletedCount} itens deletados`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao limpar histórico',
            details: error.message
        });
    }
});

// GET /api/history/stats - Estatísticas do histórico
router.get('/stats/user', verificarToken, async (req, res) => {
    try {
        const total = await History.countDocuments({ userId: req.userId });
        const porMateria = await History.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(req.userId) } },
            { $group: { _id: '$materia', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                total,
                porMateria
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar estatísticas',
            details: error.message
        });
    }
});

module.exports = router;