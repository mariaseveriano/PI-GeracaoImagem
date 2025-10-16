// server/controllers/imageController.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const OUT_DIR = path.resolve(process.cwd(), 'generated_images');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const jobs = new Map(); // jobId -> { status, prompt, ownerId, resultPath, createdAt, finishedAt }

// Função de simulação: escreve um arquivo PNG "placeholder" (1x1) ou texto em base64.
// Você deverá substituir isso pela integração real.
function simulatedGeneration(prompt, extra) {
  // cria um PNG 1x1 minimal (base64) para evitar dependências externas
  // esse PNG representa apenas um pixel transparente
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(pngBase64, 'base64');
  return { buffer, mime: 'image/png' };
}

exports.createJob = async (req, res) => {
  try {
    const owner = req.user ? req.user._id.toString() : null;
    const { prompt, imageData } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt é obrigatório' });

    const jobId = uuidv4();
    const job = {
      id: jobId,
      prompt,
      owner,
      status: 'pending',
      createdAt: new Date(),
      finishedAt: null,
      resultPath: null,
      error: null
    };
    jobs.set(jobId, job);

    // simula processo assíncrono
    setTimeout(async () => {
      try {
        // Aqui é o ponto de integração: chame API externa para gerar imagem
        const gen = simulatedGeneration(prompt, imageData);
        const filename = `${jobId}.png`;
        const filepath = path.join(OUT_DIR, filename);
        await fs.promises.writeFile(filepath, gen.buffer);
        job.status = 'done';
        job.resultPath = filepath;
        job.finishedAt = new Date();
        jobs.set(jobId, job);
        console.log(`Image job ${jobId} finished (${filepath})`);
      } catch (err) {
        job.status = 'failed';
        job.error = String(err.message || err);
        job.finishedAt = new Date();
        jobs.set(jobId, job);
        console.error('Job failed', jobId, err);
      }
    }, 1500); // 1.5s de "processamento"

    res.status(202).json({ jobId, status: job.status });
  } catch (err) {
    console.error('createJob', err);
    res.status(500).json({ error: 'Erro ao criar job' });
  }
};

exports.getJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = jobs.get(jobId);
    if (!job) return res.status(404).json({ error: 'Job não encontrado' });

    const resp = { id: job.id, status: job.status, prompt: job.prompt, createdAt: job.createdAt, finishedAt: job.finishedAt, error: job.error };

    if (job.status === 'done' && job.resultPath) {
      // retornar URL relativa ao arquivo salvo
      const urlPath = `/generated_images/${path.basename(job.resultPath)}`;
      resp.result = { url: urlPath };
    }

    res.json(resp);
  } catch (err) {
    console.error('getJob', err);
    res.status(500).json({ error: 'Erro ao ler job' });
  }
};

// Endpoint para baixar diretamente a imagem gerada
exports.serveGenerated = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(OUT_DIR, filename);
  if (!fs.existsSync(filepath)) return res.status(404).send('Not found');
  res.sendFile(filepath);
};
