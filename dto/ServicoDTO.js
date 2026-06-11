class ServicoDTO {
    static validate(body) {
        const errors = [];
        const { nome, preco, duracao } = body;

        if (!nome || typeof nome !== 'string' || !nome.trim()) {
            errors.push('O nome do serviço é obrigatório.');
        }

        const numericPreco = parseFloat(preco);
        if (isNaN(numericPreco) || numericPreco <= 0) {
            errors.push('O preço deve ser um valor numérico maior que zero.');
        }

        const numericDuracao = parseInt(duracao);
        if (isNaN(numericDuracao) || numericDuracao <= 0) {
            errors.push('A duração deve ser um número inteiro de minutos maior que zero.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: {
                nome: nome ? nome.trim() : null,
                preco: numericPreco,
                duracao: numericDuracao
            }
        };
    }
}

module.exports = ServicoDTO;
