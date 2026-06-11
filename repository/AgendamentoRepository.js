const BaseRepository = require('./BaseRepository');

class AgendamentoRepository extends BaseRepository {
    constructor() {
        super('agendamentos');
    }

    // Retorna todos os agendamentos com dados populados das outras tabelas
    async findAll(searchQuery = '') {
        let sql = `
            SELECT 
                a.*,
                c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                colab.nome AS colaborador_nome, colab.especialidade AS colaborador_especialidade, colab.telefone AS colaborador_telefone,
                s.nome AS servico_nome, s.preco AS servico_preco, s.duracao AS servico_duracao
            FROM agendamentos a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN colaboradores colab ON a.colaborador_id = colab.id
            JOIN servicos s ON a.servico_id = s.id
        `;

        const params = [];

        if (searchQuery && searchQuery.trim()) {
            const pattern = `%${searchQuery.trim()}%`;
            sql += `
                WHERE c.nome LIKE ? 
                   OR colab.nome LIKE ? 
                   OR s.nome LIKE ? 
                   OR a.status LIKE ? 
                   OR a.data_hora LIKE ?
                   OR c.telefone LIKE ?
            `;
            // 6 parâmetros para os 6 campos
            params.push(pattern, pattern, pattern, pattern, pattern, pattern);
        }

        sql += ` ORDER BY a.data_hora DESC`;

        return this.dbQuery.all(sql, params);
    }

    async findById(id) {
        const sql = `
            SELECT 
                a.*,
                c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                colab.nome AS colaborador_nome, colab.especialidade AS colaborador_especialidade, colab.telefone AS colaborador_telefone,
                s.nome AS servico_nome, s.preco AS servico_preco, s.duracao AS servico_duracao
            FROM agendamentos a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN colaboradores colab ON a.colaborador_id = colab.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.id = ?
        `;
        return this.dbQuery.get(sql, [id]);
    }

    async create(agendamentoData) {
        const { cliente_id, colaborador_id, servico_id, data_hora, status } = agendamentoData;
        return this.dbQuery.run(
            `INSERT INTO ${this.tableName} (cliente_id, colaborador_id, servico_id, data_hora, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [cliente_id, colaborador_id, servico_id, data_hora, status || 'PENDENTE']
        );
    }

    async update(id, agendamentoData) {
        const { cliente_id, colaborador_id, servico_id, data_hora, status } = agendamentoData;
        return this.dbQuery.run(
            `UPDATE ${this.tableName} 
             SET cliente_id = ?, colaborador_id = ?, servico_id = ?, data_hora = ?, status = ? 
             WHERE id = ?`,
            [cliente_id, colaborador_id, servico_id, data_hora, status, id]
        );
    }

    async updateStatus(id, status) {
        return this.dbQuery.run(
            `UPDATE ${this.tableName} SET status = ? WHERE id = ?`,
            [status, id]
        );
    }

    async findUpcoming(limit = 10) {
        // Encontra agendamentos pendentes ordenados por data decrescente ou crescente?
        // Crescente é melhor para os "próximos" agendamentos (mais próximos primeiro)
        const sql = `
            SELECT 
                a.*,
                c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                colab.nome AS colaborador_nome, colab.especialidade AS colaborador_especialidade, colab.telefone AS colaborador_telefone,
                s.nome AS servico_nome, s.preco AS servico_preco, s.duracao AS servico_duracao
            FROM agendamentos a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN colaboradores colab ON a.colaborador_id = colab.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.status = 'PENDENTE' AND a.data_hora >= datetime('now', 'localtime')
            ORDER BY a.data_hora ASC
            LIMIT ?
        `;
        return this.dbQuery.all(sql, [limit]);
    }

    async countByStatus(status) {
        const row = await this.dbQuery.get(
            `SELECT COUNT(*) as total FROM ${this.tableName} WHERE status = ?`,
            [status]
        );
        return row ? row.total : 0;
    }
}

module.exports = AgendamentoRepository;
