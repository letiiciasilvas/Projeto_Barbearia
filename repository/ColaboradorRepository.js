const BaseRepository = require('./BaseRepository');

class ColaboradorRepository extends BaseRepository {
    constructor() {
        super('colaboradores');
    }

    async findAll(searchQuery = '') {
        if (!searchQuery || !searchQuery.trim()) {
            return this.dbQuery.all(`SELECT * FROM ${this.tableName} ORDER BY nome ASC`);
        }

        const sqlPattern = `%${searchQuery.trim()}%`;
        return this.dbQuery.all(
            `SELECT * FROM ${this.tableName} 
             WHERE nome LIKE ? OR especialidade LIKE ? OR telefone LIKE ?
             ORDER BY nome ASC`,
            [sqlPattern, sqlPattern, sqlPattern]
        );
    }

    async create(colaboradorData) {
        const { nome, especialidade, telefone } = colaboradorData;
        return this.dbQuery.run(
            `INSERT INTO ${this.tableName} (nome, especialidade, telefone) VALUES (?, ?, ?)`,
            [nome, especialidade, telefone]
        );
    }

    async update(id, colaboradorData) {
        const { nome, especialidade, telefone } = colaboradorData;
        return this.dbQuery.run(
            `UPDATE ${this.tableName} SET nome = ?, especialidade = ?, telefone = ? WHERE id = ?`,
            [nome, especialidade, telefone, id]
        );
    }
}

module.exports = ColaboradorRepository;
