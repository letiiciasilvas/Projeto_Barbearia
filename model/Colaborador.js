class Colaborador {
    constructor(id, nome, especialidade, telefone, created_at) {
        this.id = id;
        this.nome = nome;
        this.especialidade = especialidade;
        this.telefone = telefone;
        this.created_at = created_at;
    }

    static fromRow(row) {
        if (!row) return null;
        return new Colaborador(row.id, row.nome, row.especialidade, row.telefone, row.created_at);
    }
}

module.exports = Colaborador;
