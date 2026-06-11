const BaseRepository = require('./BaseRepository');

class ClienteRepository extends BaseRepository {
    constructor() {
        super('clientes');
    }

    async findAll(searchQuery = '') {
        if (!searchQuery || !searchQuery.trim()) {
            return this.dbQuery.all(`SELECT * FROM ${this.tableName} ORDER BY nome ASC`);
        }

        const sqlPattern = `%${searchQuery.trim()}%`;
        return this.dbQuery.all(
            `SELECT * FROM ${this.tableName} 
             WHERE nome LIKE ? OR telefone LIKE ? OR email LIKE ? 
             ORDER BY nome ASC`,
            [sqlPattern, sqlPattern, sqlPattern]
        );
    }

    async create(clienteData) {
        const { nome, email, telefone } = clienteData;
        return this.dbQuery.run(
            `INSERT INTO ${this.tableName} (nome, email, telefone) VALUES (?, ?, ?)`,
            [nome, email, telefone]
        );
    }

    async update(id, clienteData) {
        const { nome, email, telefone } = clienteData;
        return this.dbQuery.run(
            `UPDATE ${this.tableName} SET nome = ?, email = ?, telefone = ? WHERE id = ?`,
            [nome, email, telefone, id]
        );
    }
}

module.exports = ClienteRepository;
