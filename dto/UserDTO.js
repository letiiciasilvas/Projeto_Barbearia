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

    static validateRegister(body) {
        const errors = [];
        const { nome, email, telefone, senha } = body;

        if (!nome || typeof nome !== 'string' || !nome.trim()) {
            errors.push('O nome é obrigatório.');
        }

        if (!email || typeof email !== 'string' || !email.trim()) {
            errors.push('O e-mail é obrigatório.');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.push('E-mail informado é inválido.');
        }

        if (!telefone || typeof telefone !== 'string' || !telefone.trim()) {
            errors.push('O telefone é obrigatório.');
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
                nome: nome ? nome.trim() : null,
                email: email ? email.trim().toLowerCase() : null,
                telefone: telefone ? telefone.trim() : null,
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
            cliente_id: user.cliente_id,
            created_at: user.created_at
        };
    }
}

module.exports = UserDTO;
