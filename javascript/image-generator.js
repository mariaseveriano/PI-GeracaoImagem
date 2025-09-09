document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('popup');
  const openPopup = document.getElementById('openPopup');
  const closePopup = document.getElementById('closePopup');
  const sendPrompt = document.getElementById('sendPrompt');
  const promptInput = document.getElementById('prompt');
  const statusText = document.getElementById('status');
  const generatedImage = document.getElementById('generatedImage');
  const downloadBtn = document.getElementById('downloadBtn');

  openPopup.onclick = () => popup.classList.remove('hidden');
  closePopup.onclick = () => popup.classList.add('hidden');

  sendPrompt.onclick = async () => {
    const prompt = promptInput.value;
    if (!prompt.trim()) return;

    statusText.innerText = 'Gerando imagem...';
    generatedImage.classList.add('hidden');
    downloadBtn.classList.add('hidden');

    try {
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        statusText.innerText = '';
        generatedImage.src = data.imageUrl;
        generatedImage.classList.remove('hidden');
        downloadBtn.href = data.imageUrl;
        downloadBtn.classList.remove('hidden');
      } else {
        statusText.innerText = 'Erro ao gerar imagem.';
      }
    } catch (err) {
      console.error(err);
      statusText.innerText = 'Erro de conexão com o servidor.';
    }
  };
});
