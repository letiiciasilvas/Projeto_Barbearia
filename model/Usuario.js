class Usuario {
    constructor(id, nome, email, senha, role, created_at) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.role = role;
        this.created_at = created_at;
    }

    static fromRow(row) {
        if (!row) return null;
        return new Usuario(row.id, row.nome, row.email, row.senha, row.role, row.created_at);
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            email: this.email,
            role: this.role,
            created_at: this.created_at
        };
    }
}

module.exports = Usuario;
