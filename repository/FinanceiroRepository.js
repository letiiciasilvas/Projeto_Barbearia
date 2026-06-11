const BaseRepository = require('./BaseRepository');

class FinanceiroRepository extends BaseRepository {
    constructor() {
        super('financeiro');
    }

    async create(financeiroData) {
        const { agendamento_id, tipo, valor, descricao, data } = financeiroData;
        return this.dbQuery.run(
            `INSERT INTO ${this.tableName} (agendamento_id, tipo, valor, descricao, data) 
             VALUES (?, ?, ?, ?, ?)`,
            [agendamento_id || null, tipo, valor, descricao, data]
        );
    }

    async deleteByAgendamentoId(agendamentoId) {
        return this.dbQuery.run(
            `DELETE FROM ${this.tableName} WHERE agendamento_id = ?`,
            [agendamentoId]
        );
    }

    async findAll(searchQuery = '') {
        if (!searchQuery || !searchQuery.trim()) {
            return this.dbQuery.all(`SELECT * FROM ${this.tableName} ORDER BY data DESC, id DESC`);
        }

        const sqlPattern = `%${searchQuery.trim()}%`;
        return this.dbQuery.all(
            `SELECT * FROM ${this.tableName} 
             WHERE descricao LIKE ? OR tipo LIKE ? OR data LIKE ?
             ORDER BY data DESC, id DESC`,
            [sqlPattern, sqlPattern, sqlPattern]
        );
    }

    // Receita semanal (soma das receitas dos últimos 7 dias)
    async getWeeklyRevenue() {
        const row = await this.dbQuery.get(`
            SELECT SUM(valor) as total FROM ${this.tableName} 
            WHERE tipo = 'RECEITA' AND data >= date('now', '-6 days', 'localtime')
        `);
        return row && row.total ? row.total : 0.0;
    }

    // Receita mensal (soma das receitas dos últimos 30 dias)
    async getMonthlyRevenue() {
        const row = await this.dbQuery.get(`
            SELECT SUM(valor) as total FROM ${this.tableName} 
            WHERE tipo = 'RECEITA' AND data >= date('now', '-29 days', 'localtime')
        `);
        return row && row.total ? row.total : 0.0;
    }

    // Resumo de faturamento de um período (Receitas vs Despesas)
    async findPeriodSummary(startDate, endDate) {
        const sql = `
            SELECT 
                SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END) as total_receita,
                SUM(CASE WHEN tipo = 'DESPESA' THEN valor ELSE 0 END) as total_despesa
            FROM ${this.tableName}
            WHERE data BETWEEN ? AND ?
        `;
        const row = await this.dbQuery.get(sql, [startDate, endDate]);
        return {
            receitas: row && row.total_receita ? row.total_receita : 0.0,
            despesas: row && row.total_despesa ? row.total_despesa : 0.0,
            saldo: (row && row.total_receita ? row.total_receita : 0.0) - (row && row.total_despesa ? row.total_despesa : 0.0)
        };
    }

    // Serviços mais realizados (Distribuição para Gráfico)
    async getMostPerformedServices(limit = 5) {
        const sql = `
            SELECT s.nome as servico, COUNT(a.id) as quantidade, SUM(s.preco) as faturamento
            FROM agendamentos a
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.status = 'CONCLUIDO'
            GROUP BY s.id
            ORDER BY quantidade DESC
            LIMIT ?
        `;
        return this.dbQuery.all(sql, [limit]);
    }

    // Quantidade de atendimentos por colaborador (Gráfico/Tabela de Produtividade)
    async getBarberWorkload() {
        const sql = `
            SELECT colab.nome as colaborador, COUNT(a.id) as atendimentos, SUM(s.preco) as faturamento_gerado
            FROM agendamentos a
            JOIN colaboradores colab ON a.colaborador_id = colab.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.status = 'CONCLUIDO'
            GROUP BY colab.id
            ORDER BY atendimentos DESC
        `;
        return this.dbQuery.all(sql);
    }

    // Histórico de receitas diárias para o gráfico de faturamento
    async getDailyRevenueHistory(days = 7) {
        const sql = `
            SELECT data, SUM(valor) as valor 
            FROM ${this.tableName}
            WHERE tipo = 'RECEITA' AND data >= date('now', ?, 'localtime')
            GROUP BY data
            ORDER BY data ASC
        `;
        // Ex: '-6 days'
        const rangeParam = `-${days - 1} days`;
        return this.dbQuery.all(sql, [rangeParam]);
    }
}

module.exports = FinanceiroRepository;
