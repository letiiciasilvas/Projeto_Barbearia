class Cliente {
    constructor(id, nome, email, telefone, created_at) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.created_at = created_at;
    }

    static fromRow(row) {
        if (!row) return null;
        return new Cliente(row.id, row.nome, row.email, row.telefone, row.created_at);
    }
}

module.exports = Cliente;
