class Servico {
    constructor(id, nome, preco, duracao, created_at) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.duracao = duracao; // em minutos
        this.created_at = created_at;
    }

    static fromRow(row) {
        if (!row) return null;
        return new Servico(row.id, row.nome, row.preco, row.duracao, row.created_at);
    }
}

module.exports = Servico;
