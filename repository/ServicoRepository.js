const BaseRepository = require('./BaseRepository');

class ServicoRepository extends BaseRepository {
    constructor() {
        super('servicos');
    }

    async findAll(searchQuery = '') {
        if (!searchQuery || !searchQuery.trim()) {
            return this.dbQuery.all(`SELECT * FROM ${this.tableName} ORDER BY nome ASC`);
        }

        const sqlPattern = `%${searchQuery.trim()}%`;
        return this.dbQuery.all(
            `SELECT * FROM ${this.tableName} 
             WHERE nome LIKE ? 
             ORDER BY nome ASC`,
            [sqlPattern]
        );
    }

    async create(servicoData) {
        const { nome, preco, duracao } = servicoData;
        return this.dbQuery.run(
            `INSERT INTO ${this.tableName} (nome, preco, duracao) VALUES (?, ?, ?)`,
            [nome, preco, duracao]
        );
    }

    async update(id, servicoData) {
        const { nome, preco, duracao } = servicoData;
        return this.dbQuery.run(
            `UPDATE ${this.tableName} SET nome = ?, preco = ?, duracao = ? WHERE id = ?`,
            [nome, preco, duracao, id]
        );
    }
}

module.exports = ServicoRepository;
