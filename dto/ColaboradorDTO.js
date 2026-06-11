class ColaboradorDTO {
    static validate(body) {
        const errors = [];
        const { nome, especialidade, telefone } = body;

        if (!nome || typeof nome !== 'string' || !nome.trim()) {
            errors.push('O nome do colaborador é obrigatório.');
        }

        if (!especialidade || typeof especialidade !== 'string' || !especialidade.trim()) {
            errors.push('A especialidade é obrigatória.');
        }

        if (!telefone || typeof telefone !== 'string' || !telefone.trim()) {
            errors.push('O telefone do colaborador é obrigatório.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: {
                nome: nome ? nome.trim() : null,
                especialidade: especialidade ? especialidade.trim() : null,
                telefone: telefone ? telefone.trim() : null
            }
        };
    }
}

module.exports = ColaboradorDTO;
