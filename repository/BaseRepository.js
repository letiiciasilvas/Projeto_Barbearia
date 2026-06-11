const { dbQuery } = require('../config/database');

class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
        this.dbQuery = dbQuery;
    }

    async findById(id) {
        return this.dbQuery.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    }

    async delete(id) {
        return this.dbQuery.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    }

    async count() {
        const row = await this.dbQuery.get(`SELECT COUNT(*) as total FROM ${this.tableName}`);
        return row ? row.total : 0;
    }
}

module.exports = BaseRepository;
