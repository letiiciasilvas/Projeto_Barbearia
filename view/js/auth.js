// Controle de Autenticação do Cliente
(function() {
    const token = localStorage.getItem('fio_navalha_token');
    const path = window.location.pathname;

    // Se estiver no dashboard e não tiver token, manda pro login
    if (path.includes('dashboard.html') && !token) {
        window.location.href = '/login.html';
    }

    // Se estiver no login e já tiver token, manda pro dashboard
    if (path.includes('login.html') && token) {
        window.location.href = '/dashboard.html';
    }
})();

// Retorna o cabeçalho de autenticação Bearer JWT
function getAuthHeaders() {
    const token = localStorage.getItem('fio_navalha_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Desloga o usuário e limpa o localStorage
function logout() {
    localStorage.removeItem('fio_navalha_token');
    localStorage.removeItem('fio_navalha_user');
    window.location.href = '/login.html';
}

// Retorna os dados do usuário logado
function getLoggedUser() {
    const userJson = localStorage.getItem('fio_navalha_user');
    try {
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        return null;
    }
}

// ==================== CONTROLE DE TEMA (CLARO / ESCURO) ====================

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    atualizarIconesTema();
}

function atualizarIconesTema() {
    const isLight = document.documentElement.classList.contains('light-theme');
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(icon => {
        if (isLight) {
            icon.className = 'fa-solid fa-sun theme-toggle-icon';
        } else {
            icon.className = 'fa-solid fa-moon theme-toggle-icon';
        }
    });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    atualizarIconesTema();
    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });
});
