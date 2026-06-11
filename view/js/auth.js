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
