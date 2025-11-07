const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

// Diretório para salvar imagens geradas
const OUT_DIR = path.resolve(process.cwd(), 'generated_images');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`📁 Diretório criado: ${OUT_DIR}`);
}

// Armazenamento de jobs em memória (em produção, use Redis ou banco de dados)
const jobs = new Map(); // jobId -> { status, prompt, ownerId, resultPath, createdAt, finishedAt, error }

// Configuração da API 
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HUGGINGFACE_ENDPOINT = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

/**
 * Função para gerar imagem usando Hugging Face API
 */
async function gerarImagemHuggingFace(prompt) {
  try {
    console.log('🎨 Gerando imagem com prompt:', prompt);

    const response = await fetch(HUGGINGFACE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 4,
          guidance_scale: 0
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', response.status, errorText);

      if (response.status === 401) {
        throw new Error('Token inválido ou expirado');
      } else if (response.status === 503) {
        throw new Error('Modelo está carregando. Tente novamente em alguns segundos.');
      } else if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      } else {
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    }

    const buffer = await response.buffer();
    console.log('✅ Imagem gerada com sucesso');

    return {
      buffer,
      mime: 'image/png'
    };

  } catch (error) {
    console.error('💥 Erro ao gerar imagem:', error);
    throw error;
  }
}

/**
 * POST /api/images - Criar job de geração de imagem
 */
exports.createJob = async (req, res) => {
  try {
    const owner = req.user ? req.user._id.toString() : null;
    const { prompt, materia, conteudo, estilo, infoAdicional } = req.body;

    // Validação
    if (!prompt) {
      return res.status(400).json({
        error: 'prompt é obrigatório'
      });
    }

    // Criar ID único para o job
    const jobId = uuidv4();

    // Criar registro do job
    const job = {
      id: jobId,
      prompt,
      materia,
      conteudo,
      estilo,
      infoAdicional,
      owner,
      status: 'pending',
      createdAt: new Date(),
      finishedAt: null,
      resultPath: null,
      imageUrl: null,
      error: null
    };

    jobs.set(jobId, job);

    console.log(`\n📋 Novo job criado: ${jobId}`);
    console.log(`👤 Usuário: ${owner}`);
    console.log(`📝 Prompt: ${prompt}`);

    // Processar imagem de forma assíncrona
    processarImagem(jobId, prompt);

    // Retornar jobId imediatamente
    res.status(202).json({
      jobId,
      status: job.status,
      message: 'Job criado com sucesso. Use GET /api/images/:id para verificar o status.'
    });

  } catch (err) {
    console.error('❌ Erro ao criar job:', err);
    res.status(500).json({
      error: 'Erro ao criar job',
      details: err.message
    });
  }
};

/**
 * Processar imagem de forma assíncrona
 */
async function processarImagem(jobId, prompt) {
  const job = jobs.get(jobId);

  try {
    job.status = 'processing';
    console.log(`⏳ Processando job ${jobId}...`);

    // Gerar imagem usando Hugging Face
    const resultado = await gerarImagemHuggingFace(prompt);

    // Salvar arquivo
    const filename = `${jobId}.png`;
    const filepath = path.join(OUT_DIR, filename);

    await fs.promises.writeFile(filepath, resultado.buffer);
    console.log(`💾 Arquivo salvo: ${filepath}`);

    // Atualizar job
    job.status = 'done';
    job.resultPath = filepath;
    job.imageUrl = `/generated_images/${filename}`;
    job.finishedAt = new Date();

    jobs.set(jobId, job);

    console.log(`✅ Job ${jobId} concluído com sucesso`);

  } catch (err) {
    console.error(`💥 Job ${jobId} falhou:`, err);

    job.status = 'failed';
    job.error = err.message || 'Erro desconhecido';
    job.finishedAt = new Date();

    jobs.set(jobId, job);
  }
}

/**
 * GET /api/images/:id - Consultar status do job
 */
exports.getJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job não encontrado'
      });
    }

    // Verificar permissão (se tiver autenticação)
    if (req.user && job.owner && job.owner !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Sem permissão para acessar este job'
      });
    }

    const response = {
      id: job.id,
      status: job.status,
      prompt: job.prompt,
      materia: job.materia,
      conteudo: job.conteudo,
      estilo: job.estilo,
      createdAt: job.createdAt,
      finishedAt: job.finishedAt,
      error: job.error
    };

    // Se job concluído, adicionar URL da imagem
    if (job.status === 'done' && job.imageUrl) {
      response.imageUrl = job.imageUrl;
      response.downloadUrl = `/api/images/download/${path.basename(job.resultPath)}`;
    }

    res.json(response);

  } catch (err) {
    console.error('❌ Erro ao buscar job:', err);
    res.status(500).json({
      error: 'Erro ao buscar job',
      details: err.message
    });
  }
};

/**
 * GET /api/images/download/:filename - Baixar imagem gerada
 */
exports.serveGenerated = (req, res) => {
  try {
    const filename = req.params.filename;

    // Validação básica de segurança
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        error: 'Nome de arquivo inválido'
      });
    }

    const filepath = path.join(OUT_DIR, filename);

    // Verificar se arquivo existe
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        error: 'Arquivo não encontrado'
      });
    }

    // Servir arquivo
    res.sendFile(filepath);

  } catch (err) {
    console.error('❌ Erro ao servir arquivo:', err);
    res.status(500).json({
      error: 'Erro ao servir arquivo',
      details: err.message
    });
  }
};

/**
 * DELETE /api/images/:id - Deletar job e arquivo
 */
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job não encontrado'
      });
    }

    // Verificar permissão
    if (req.user && job.owner && job.owner !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Sem permissão para deletar este job'
      });
    }

    // Deletar arquivo se existir
    if (job.resultPath && fs.existsSync(job.resultPath)) {
      await fs.promises.unlink(job.resultPath);
      console.log(`🗑️ Arquivo deletado: ${job.resultPath}`);
    }

    // Remover job da memória
    jobs.delete(jobId);

    res.json({
      success: true,
      message: 'Job deletado com sucesso'
    });

  } catch (err) {
    console.error('❌ Erro ao deletar job:', err);
    res.status(500).json({
      error: 'Erro ao deletar job',
      details: err.message
    });
  }
};

/**
 * GET /api/images - Listar jobs do usuário
 */
exports.listJobs = async (req, res) => {
  try {
    const owner = req.user ? req.user._id.toString() : null;

    // Filtrar jobs do usuário
    const userJobs = Array.from(jobs.values())
      .filter(job => !owner || job.owner === owner)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(job => ({
        id: job.id,
        status: job.status,
        prompt: job.prompt,
        materia: job.materia,
        conteudo: job.conteudo,
        estilo: job.estilo,
        createdAt: job.createdAt,
        finishedAt: job.finishedAt,
        imageUrl: job.imageUrl
      }));

    res.json({
      total: userJobs.length,
      jobs: userJobs
    });

  } catch (err) {
    console.error('❌ Erro ao listar jobs:', err);
    res.status(500).json({
      error: 'Erro ao listar jobs',
      details: err.message
    });
  }
};

/**
 * Limpar jobs antigos (executar periodicamente)
 */
function limparJobsAntigos() {
  const TEMPO_MAXIMO = 24 * 60 * 60 * 1000; // 24 horas
  const agora = new Date();

  let removidos = 0;

  for (const [jobId, job] of jobs.entries()) {
    const idade = agora - job.createdAt;

    if (idade > TEMPO_MAXIMO) {
      // Deletar arquivo se existir
      if (job.resultPath && fs.existsSync(job.resultPath)) {
        fs.unlinkSync(job.resultPath);
      }

      jobs.delete(jobId);
      removidos++;
    }
  }

  if (removidos > 0) {
    console.log(`🧹 ${removidos} jobs antigos removidos`);
  }
}

// Executar limpeza a cada hora
setInterval(limparJobsAntigos, 60 * 60 * 1000);

module.exports = exports;