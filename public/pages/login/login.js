document.addEventListener('DOMContentLoaded', function () {
    const senhaInput = document.getElementById('senha');
    const toggleSenha = document.getElementById('toggleSenha');

    toggleSenha.addEventListener('click', function () {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            toggleSenha.textContent = '🙈';
        } else {
            senhaInput.type = 'password';
            toggleSenha.textContent = '👁️';
        }
    });

    document.querySelector('form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = senhaInput.value;

        if (!email || !senha) {
            alert('Preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (data.token) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                alert('Login realizado com sucesso!');
                window.location.href = '../chat/chat.html';
            } else {
                alert(data.error || 'Erro ao efetuar login');
            }
        } catch (err) {
            console.error('Erro:', err);
            alert('Erro ao conectar com o servidor');
        }
    });
});