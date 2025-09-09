// server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const PromptSchema = new mongoose.Schema({
  prompt: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Prompt = mongoose.model('Prompt', PromptSchema);

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  const entry = new Prompt({ prompt });
  await entry.save();

  try {
    const response = await axios.post('https://api.starryai.com/v1/generate', {
      prompt
    }, {
      headers: { Authorization: `Bearer ${process.env.STARRYAI_KEY}` }
    });
    entry.imageUrl = response.data.imageUrl;
    await entry.save();
    res.json({ id: entry._id, imageUrl: entry.imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao gerar imagem' });
  }
});

app.listen(3000, () => console.log('Server rodando na porta 3000'));
