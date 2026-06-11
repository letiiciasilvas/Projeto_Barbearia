class Financeiro {
    constructor(id, agendamento_id, tipo, valor, descricao, data, created_at, agendamento = null) {
        this.id = id;
        this.agendamento_id = agendamento_id;
        this.tipo = tipo; // 'RECEITA' ou 'DESPESA'
        this.valor = valor;
        this.descricao = descricao;
        this.data = data; // 'YYYY-MM-DD'
        this.created_at = created_at;
        
        // Relacionamento opcional
        this.agendamento = agendamento;
    }

    static fromRow(row) {
        if (!row) return null;
        return new Financeiro(
            row.id,
            row.agendamento_id,
            row.tipo,
            row.valor,
            row.descricao,
            row.data,
            row.created_at
        );
    }
}

module.exports = Financeiro;
