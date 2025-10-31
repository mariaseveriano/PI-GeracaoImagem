const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        materia: {
            type: String,
            required: true
        },
        conteudo: {
            type: String,
            required: true
        },
        estilo: {
            type: String,
            required: true
        },
        infoAdicional: {
            type: String,
            default: ''
        },
        prompt: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        imageData: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['success', 'error'],
            default: 'success'
        },
        errorMessage: {
            type: String
        },
        duration: {
            type: Number
        }
    },
    {
        timestamps: true,
        collection: 'history'
    }
);

historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ materia: 1 });
historySchema.index({ conteudo: 1 });

module.exports = mongoose.model('History', historySchema);