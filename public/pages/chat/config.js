const CONFIG = {
    // Defina qual API você está usando
    API_EM_USO: 'huggingface',

    huggingface: {
        apiKey: '#',
        endpoint: '#',
        model: 'stabilityai/stable-diffusion-xl-base-1.0'
    },
};

// Verificar se a API está configurada
function verificarConfiguracao() {
    const apiAtual = CONFIG[CONFIG.API_EM_USO];

    if (!apiAtual) {
        throw new Error(`API "${CONFIG.API_EM_USO}" não encontrada na configuração`);
    }

    if (!apiAtual.apiKey || apiAtual.apiKey.includes('SUA_CHAVE')) {
        throw new Error(`Chave de API não configurada para ${CONFIG.API_EM_USO}`);
    }

    return true;
}

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, verificarConfiguracao };
}