class Agendamento {
    constructor(id, cliente_id, colaborador_id, servico_id, data_hora, status, created_at, cliente = null, colaborador = null, servico = null) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.colaborador_id = colaborador_id;
        this.servico_id = servico_id;
        this.data_hora = data_hora;
        this.status = status; // 'PENDENTE', 'CONCLUIDO', 'CANCELADO'
        this.created_at = created_at;
        
        // Relacionamentos carregados opcionalmente
        this.cliente = cliente;
        this.colaborador = colaborador;
        this.servico = servico;
    }

    static fromRow(row) {
        if (!row) return null;
        
        let cliente = null;
        if (row.cliente_nome) {
            cliente = {
                id: row.cliente_id,
                nome: row.cliente_nome,
                email: row.cliente_email,
                telefone: row.cliente_telefone
            };
        }

        let colaborador = null;
        if (row.colaborador_nome) {
            colaborador = {
                id: row.colaborador_id,
                nome: row.colaborador_nome,
                especialidade: row.colaborador_especialidade,
                telefone: row.colaborador_telefone
            };
        }

        let servico = null;
        if (row.servico_nome) {
            servico = {
                id: row.servico_id,
                nome: row.servico_nome,
                preco: row.servico_preco,
                duracao: row.servico_duracao
            };
        }

        return new Agendamento(
            row.id,
            row.cliente_id,
            row.colaborador_id,
            row.servico_id,
            row.data_hora,
            row.status,
            row.created_at,
            cliente,
            colaborador,
            servico
        );
    }
}

module.exports = Agendamento;
