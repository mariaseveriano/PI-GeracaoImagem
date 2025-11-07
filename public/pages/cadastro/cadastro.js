document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const nome = document.querySelector('input[placeholder="Nome"]').value;
        const email = document.querySelector('input[type="email"]').value;
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
        if (!tipo) {
            alert('Selecione se você é Professor ou Aluno!');
            return;
        }
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }
        console.log('Dados enviados:', { nome, email, senha, tipo });
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha, tipo })
            });
            const data = await response.json();
            alert(data.token ? 'Cadastro realizado com sucesso!' : (data.error || 'Erro ao cadastrar'));
            if (data.token) {
                window.location.href = '../login/login.html';
            }
        } catch (err) {
            alert('Erro ao conectar com o servidor');
        }
    });
});