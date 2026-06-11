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
        const { nome, email, senha, role } = userData;
        return this.dbQuery.run(
            `INSERT INTO ${this.tableName} (nome, email, senha, role) VALUES (?, ?, ?, ?)`,
            [nome, email.toLowerCase(), senha, role || 'OPERADOR']
        );
    }
}

module.exports = UserRepository;
