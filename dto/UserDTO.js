class UserDTO {
    static validateLogin(body) {
        const errors = [];
        const { email, senha } = body;

        if (!email || typeof email !== 'string' || !email.trim()) {
            errors.push('O e-mail é obrigatório.');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.push('E-mail informado é inválido.');
        }

        if (!senha || typeof senha !== 'string' || !senha.trim()) {
            errors.push('A senha é obrigatória.');
        } else if (senha.length < 5) {
            errors.push('A senha deve ter pelo menos 5 caracteres.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: {
                email: email ? email.trim().toLowerCase() : null,
                senha
            }
        };
    }

    static toResponse(user) {
        if (!user) return null;
        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        };
    }
}

module.exports = UserDTO;
