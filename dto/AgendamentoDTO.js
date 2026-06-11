class AgendamentoDTO {
    static validate(body) {
        const errors = [];
        const { cliente_id, colaborador_id, servico_id, data_hora, status } = body;

        if (!cliente_id || isNaN(parseInt(cliente_id))) {
            errors.push('O cliente é obrigatório.');
        }

        if (!colaborador_id || isNaN(parseInt(colaborador_id))) {
            errors.push('O colaborador (barbeiro) é obrigatório.');
        }

        if (!servico_id || isNaN(parseInt(servico_id))) {
            errors.push('O serviço é obrigatório.');
        }

        if (!data_hora || typeof data_hora !== 'string' || !data_hora.trim()) {
            errors.push('A data e hora do agendamento são obrigatórias.');
        } else {
            // Verificar padrão básico YYYY-MM-DD HH:MM ou ISO
            const dateObj = new Date(data_hora);
            if (isNaN(dateObj.getTime())) {
                errors.push('A data e hora informadas são inválidas.');
            }
        }

        if (status && !['PENDENTE', 'CONCLUIDO', 'CANCELADO'].includes(status)) {
            errors.push('Status inválido. Deve ser PENDENTE, CONCLUIDO ou CANCELADO.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            data: {
                cliente_id: parseInt(cliente_id),
                colaborador_id: parseInt(colaborador_id),
                servico_id: parseInt(servico_id),
                data_hora: data_hora ? data_hora.replace('T', ' ') : null, // Ajustar para o formato SQLite DATETIME
                status: status || 'PENDENTE'
            }
        };
    }
}

module.exports = AgendamentoDTO;
