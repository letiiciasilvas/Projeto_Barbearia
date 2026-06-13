const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
    constructor() {
        super('usuarios');
    }

    async findByEmail(email) {
        return this.dbQuery.get(
            `SELECT * FROM ${this.tableName} WHERE email = ?`,
            [email.toLowerCase()]
        );
    }

    async create(userData) {
        const { nome, email, senha, role, cliente_id } = userData;
        return this.dbQuery.run(
            `INSERT INTO ${this.tableName} (nome, email, senha, role, cliente_id) VALUES (?, ?, ?, ?, ?)`,
            [nome, email.toLowerCase(), senha, role || 'OPERADOR', cliente_id || null]
        );
    }

    // Registra o cliente e cria o usuário correspondente
    async registrarCliente(nome, email, telefone, senhaCriptografada) {
        // 1. Inserir na tabela clientes
        const clienteResult = await this.dbQuery.run(
            `INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)`,
            [nome, email, telefone]
        );
        const clienteId = clienteResult.id;

        // 2. Inserir na tabela usuarios vinculando o cliente_id
        const userResult = await this.dbQuery.run(
            `INSERT INTO ${this.tableName} (nome, email, senha, role, cliente_id) VALUES (?, ?, ?, 'CLIENTE', ?)`,
            [nome, email, senhaCriptografada, clienteId]
        );

        return {
            clienteId,
            userId: userResult.id
        };
    }
}

module.exports = UserRepository;
