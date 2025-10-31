const CONFIG = {
    API_EM_USO: 'huggingface',

    huggingface: {
        apiKey: '#',
        endpoint: '#',
        model: 'black-forest-labs/FLUX.1-schnell'
    },
};

function verificarConfiguracao() {
    const apiAtual = CONFIG[CONFIG.API_EM_USO];

    // Verifica se API existe
    if (!apiAtual) {
        throw new Error(`❌ API "${CONFIG.API_EM_USO}" não encontrada na configuração`);
    }

    // Verifica se o token foi configurado
    if (!apiAtual.apiKey || apiAtual.apiKey === 'SEU_TOKEN_AQUI') {
        throw new Error('⚠️ ATENÇÃO: Você precisa colar seu token do Hugging Face no config.js!\n\nSiga os passos:\n1. Acesse: huggingface.co/settings/tokens\n2. Clique em "New token"\n3. Escolha tipo "read"\n4. Copie o token gerado\n5. Cole no lugar de "SEU_TOKEN_AQUI"');
    }

    // Verifica formato básico
    if (!apiAtual.apiKey.startsWith('hf_')) {
        throw new Error('❌ Token inválido! O token deve começar com "hf_"');
    }

    console.log('✅ Configuração válida!');
    return true;
}

// CRIAR PROMPTS 

function criarPrompt(materia, conteudo, estilo, infoAdicional) {
    const prompts = {
        quimica: {
            'tabela-periódica': 'periodic table of elements with colorful boxes, scientific poster style',
            'reações-químicas': 'chemical reaction diagram showing molecular bonds and atoms',
            'ligação-covalente': 'covalent bond diagram with atoms sharing electrons, molecular structure'
        },
        fisica: {
            'resistores': 'electrical resistors in circuit diagram, electronic components illustration',
            'capacitores': 'capacitors in electrical circuit, electronic schematic',
            'geradores': 'electrical generator cross-section diagram, physics illustration',
            'blocos': 'physics blocks on surface with force arrows and vectors',
            'plano-inclinado': 'inclined plane with object, force vectors diagram, physics',
            'roldanas': 'pulley system with ropes and weights, mechanical advantage diagram'
        }
    };

    const estiloMap = {
        'molecular': 'molecular 3D visualization style, scientific rendering',
        '3d': '3D realistic style, professional illustration',
        'esquemático': 'schematic technical drawing style, clean lines',
        'minimalista': 'minimalist design, simple and clean, modern'
    };

    // Monta o prompt base
    let prompt = prompts[materia]?.[conteudo] || `${materia} ${conteudo} educational illustration`;

    // Adiciona estilo
    if (estilo && estiloMap[estilo]) {
        prompt += `, ${estiloMap[estilo]}`;
    }

    // Adiciona informações adicionais do usuário
    if (infoAdicional && infoAdicional.trim()) {
        prompt += `, ${infoAdicional}`;
    }

    // Adiciona qualificadores finais
    prompt += ', high quality, detailed, educational content, professional, white background';

    return prompt;
}


//  GERAR IMAGEM 

async function gerarImagemAPI(materia, conteudo, estilo, infoAdicional) {
    const startTime = Date.now();

    try {
        // 1. Verificar se está configurado
        verificarConfiguracao();

        // 2. Criar prompt otimizado
        const prompt = criarPrompt(materia, conteudo, estilo, infoAdicional);
        console.log('📝 Prompt enviado:', prompt);
        console.log('🔑 Usando token:', CONFIG.huggingface.apiKey.substring(0, 10) + '...');

        // 3. Fazer requisição para a API
        console.log('⏳ Enviando requisição...');
        const response = await fetch(CONFIG.huggingface.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.huggingface.apiKey}`,
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

        // 4. Verificar resposta
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro da API:', response.status, errorText);

            // Mensagens de erro específicas
            if (response.status === 401) {
                throw new Error('🔐 Token inválido ou expirado!\n\nVerifique se você:\n- Copiou o token completo\n- O token começa com "hf_"\n- O token não expirou');
            } else if (response.status === 503) {
                throw new Error('⏳ Modelo está carregando...\n\nAguarde 20 segundos e tente novamente.');
            } else if (response.status === 429) {
                throw new Error('⚠️ Muitas requisições!\n\nAguarde um minuto antes de tentar novamente.');
            } else {
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        }

        // 5. Converter resposta em imagem
        console.log('🎨 Processando imagem...');
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        const duration = Date.now() - startTime;
        console.log(`✅ Imagem gerada com sucesso em ${(duration / 1000).toFixed(2)}s!`);

        // 6. Registrar no log
        await logGeneration({
            materia,
            conteudo,
            estilo,
            status: 'success',
            message: '✅ Imagem gerada com sucesso!',
            duration,
            prompt
        });

        return imageUrl;

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error('💥 Erro completo:', error);

        // Registrar erro no log
        await logGeneration({
            materia,
            conteudo,
            estilo,
            status: 'error',
            message: error.message,
            duration
        });

        throw error;
    }
}

// ============================================
// 📊 SISTEMA DE LOGS PERSISTENTE
// ============================================

async function logGeneration(data) {
    try {
        // Carregar logs existentes
        let logs = [];
        try {
            const result = await window.storage.get('pictura-logs');
            if (result) {
                logs = JSON.parse(result.value);
            }
        } catch (e) {
            // Primeiro log
        }

        // Criar novo log
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            timestampBR: new Date().toLocaleString('pt-BR'),
            ...data
        };

        logs.unshift(newLog);

        // Manter apenas os últimos 100
        if (logs.length > 100) {
            logs = logs.slice(0, 100);
        }

        // Salvar
        await window.storage.set('pictura-logs', JSON.stringify(logs));
        console.log('📊 Log registrado');

    } catch (error) {
        console.warn('Não foi possível salvar log:', error);
    }
}


// Quando a página carregar
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎨 Sistema Pictura carregado');

    // Substitui o submit do formulário
    const form = document.getElementById('picturaForm');
    if (!form) {
        console.error('❌ Formulário não encontrado! Certifique-se que o ID é "picturaForm"');
        return;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Pegar valores dos campos
        const materia = document.getElementById('opcoes-materia')?.value;
        const conteudo = document.getElementById('conteudo')?.value;
        const estilo = document.getElementById('estilo-imagem')?.value;
        const infoAdicional = document.getElementById('info-adicional')?.value || '';

        // Validação
        if (!materia || !conteudo || !estilo) {
            alert('❌ Por favor, preencha todos os campos obrigatórios:\n- Matéria\n- Conteúdo\n- Estilo');
            return;
        }

        // Desabilitar botão
        const btnEnviar = document.querySelector('.btn-enviar');
        if (!btnEnviar) {
            console.error('❌ Botão de enviar não encontrado!');
            return;
        }

        const textoOriginal = btnEnviar.textContent;
        btnEnviar.disabled = true;
        btnEnviar.textContent = '⏳ Gerando...';

        try {
            // Abrir popup com loading
            if (typeof openPopup === 'function') {
                openPopup('', materia, conteudo, estilo);
            }

            console.log('🚀 Iniciando geração...');

            // Gerar imagem
            const imageUrl = await gerarImagemAPI(materia, conteudo, estilo, infoAdicional);
            console.log('✅ Imagem gerada:', imageUrl);

            // 3. Atualizar popup com a imagem
            if (typeof updatePopupImage === 'function') {
                updatePopupImage(imageUrl);
            } else {

                // Fallback: atualizar manualmente
                const generatedImage = document.getElementById('generatedImage');
                const loadingContainer = document.getElementById('loadingContainer');
                const imageResultContainer = document.getElementById('imageResultContainer');

                if (generatedImage && loadingContainer && imageResultContainer) {
                    generatedImage.src = imageUrl;

                    generatedImage.onload = () => {
                        loadingContainer.style.display = 'none';
                        imageResultContainer.classList.add('active');
                    };

                    generatedImage.onerror = () => {
                        loadingContainer.innerHTML = `
                            <i class='bx bx-error' style='font-size: 60px; color: #ff4d4d;'></i>
                            <p class="loading-text" style="color: #ff4d4d;">Erro ao carregar a imagem</p>
                            <button class="btn-enviar" onclick="closePopup()" style="margin-top: 20px;">Fechar</button>
                        `;
                    };
                }
            }

        } catch (error) {
            console.error('💥 Erro ao gerar:', error);

            // Atualizar loading com erro
            const loadingContainer = document.getElementById('loadingContainer');
            if (loadingContainer) {
                loadingContainer.innerHTML = `
                    <i class='bx bx-error' style='font-size: 60px; color: #ff4d4d;'></i>
                    <p class="loading-text" style="color: #ff4d4d;">${error.message}</p>
                    <button class="btn-enviar" onclick="closePopup()" style="margin-top: 20px;">Fechar</button>
                `;
            }

        } finally {
            // Reabilitar botão
            btnEnviar.disabled = false;
            btnEnviar.textContent = textoOriginal;
        }
    });

    console.log('✅ Sistema pronto! Preencha o formulário e clique em enviar.');
});

