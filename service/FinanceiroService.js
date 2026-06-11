const FinanceiroRepository = require('../repository/FinanceiroRepository');
const ClienteRepository = require('../repository/ClienteRepository');
const ColaboradorRepository = require('../repository/ColaboradorRepository');
const ServicoRepository = require('../repository/ServicoRepository');
const AgendamentoRepository = require('../repository/AgendamentoRepository');

const financeiroRepo = new FinanceiroRepository();
const clienteRepo = new ClienteRepository();
const colaboradorRepo = new ColaboradorRepository();
const servicoRepo = new ServicoRepository();
const agendamentoRepo = new AgendamentoRepository();

class FinanceiroService {
    async listarTodos(searchQuery = '') {
        return financeiroRepo.findAll(searchQuery);
    }

    async buscarPorId(id) {
        const registro = await financeiroRepo.findById(id);
        if (!registro) {
            throw new Error('Registro financeiro não encontrado.');
        }
        return registro;
    }

    async criar(financeiroData) {
        return financeiroRepo.create(financeiroData);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return financeiroRepo.delete(id);
    }

    // Retorna todos os dados para alimentar o Dashboard em tempo real
    async obterDadosDashboard() {
        try {
            const totalClientes = await clienteRepo.count();
            const totalColaboradores = await colaboradorRepo.count();
            const totalServicos = await servicoRepo.count();
            const totalAgendamentos = await agendamentoRepo.count();
            
            const receitaSemanal = await financeiroRepo.getWeeklyRevenue();
            const receitaMensal = await financeiroRepo.getMonthlyRevenue();
            
            const proximosAgendamentos = await agendamentoRepo.findUpcoming(8);
            
            // Gráficos e indicadores
            const historicoFaturamento = await financeiroRepo.getDailyRevenueHistory(7); // últimos 7 dias
            const servicosMaisRealizados = await financeiroRepo.getMostPerformedServices(5);
            const produtividadeColaboradores = await financeiroRepo.getBarberWorkload();

            return {
                indicadores: {
                    totalClientes,
                    totalColaboradores,
                    totalServicos,
                    totalAgendamentos,
                    receitaSemanal,
                    receitaMensal
                },
                proximosAgendamentos,
                graficos: {
                    historicoFaturamento,
                    servicosMaisRealizados,
                    produtividadeColaboradores
                }
            };
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            throw error;
        }
    }

    // Gera o relatório com base em filtros de período
    async gerarRelatorioPeriodo(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('As datas de início e fim são obrigatórias.');
        }

        const resumo = await financeiroRepo.findPeriodSummary(startDate, endDate);
        
        // Obter todas as transações financeiras do período
        const sqlTransactions = `
            SELECT * FROM financeiro 
            WHERE data BETWEEN ? AND ? 
            ORDER BY data ASC, id ASC
        `;
        const transacoes = await financeiroRepo.dbQuery.all(sqlTransactions, [startDate, endDate]);

        // Quantidade de atendimentos concluídos no período
        const sqlCount = `
            SELECT COUNT(*) as total FROM agendamentos 
            WHERE status = 'CONCLUIDO' AND data_hora BETWEEN ? AND ?
        `;
        // Adicionar horas extremas para cobrir todo o dia
        const startDateTime = `${startDate} 00:00:00`;
        const endDateTime = `${endDate} 23:59:59`;
        const countRow = await agendamentoRepo.dbQuery.get(sqlCount, [startDateTime, endDateTime]);
        const atendimentosRealizados = countRow ? countRow.total : 0;

        return {
            periodo: { inicio: startDate, fim: endDate },
            resumo,
            atendimentosRealizados,
            transacoes
        };
    }
}

module.exports = FinanceiroService;
