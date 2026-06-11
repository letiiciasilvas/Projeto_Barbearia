class ClienteDTO {
    static validate(body) {
        const errors = [];
        const { nome, email, telefone } = body;

        if (!nome || typeof nome !== 'string' || !nome.trim()) {
            errors.push('O nome do cliente é obrigatório.');
        }

        if (!telefone || typeof telefone !== 'string' || !telefone.trim()) {
            errors.push('O telefone do cliente é obrigatório.');
        }

        if (email && email.trim() && !/\S+@\S+\.\S+/.test(email)) {
            errors.push('O e-mail informado é inválido.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: {
                nome: nome ? nome.trim() : null,
                email: email && email.trim() ? email.trim().toLowerCase() : null,
                telefone: telefone ? telefone.trim() : null
            }
        };
    }
}

module.exports = ClienteDTO;
