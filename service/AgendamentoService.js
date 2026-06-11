const AgendamentoRepository = require('../repository/AgendamentoRepository');
const FinanceiroRepository = require('../repository/FinanceiroRepository');
const ClienteRepository = require('../repository/ClienteRepository');
const ColaboradorRepository = require('../repository/ColaboradorRepository');
const ServicoRepository = require('../repository/ServicoRepository');

const agendamentoRepo = new AgendamentoRepository();
const financeiroRepo = new FinanceiroRepository();
const clienteRepo = new ClienteRepository();
const colaboradorRepo = new ColaboradorRepository();
const servicoRepo = new ServicoRepository();

class AgendamentoService {
    async listarTodos(searchQuery = '') {
        return agendamentoRepo.findAll(searchQuery);
    }

    async buscarPorId(id) {
        const agendamento = await agendamentoRepo.findById(id);
        if (!agendamento) {
            throw new Error('Agendamento não encontrado.');
        }
        return agendamento;
    }

    async criar(agendamentoData) {
        const result = await agendamentoRepo.create(agendamentoData);
        
        // Se já for criado como CONCLUIDO (raro, mas possível), gera receita
        if (agendamentoData.status === 'CONCLUIDO') {
            await this._registrarReceita(result.id, agendamentoData);
        }
        
        return result;
    }

    async atualizar(id, agendamentoData) {
        const oldAgendamento = await this.buscarPorId(id);
        
        const result = await agendamentoRepo.update(id, agendamentoData);

        // Lógica de sincronização financeira
        if (oldAgendamento.status === 'CONCLUIDO' && agendamentoData.status !== 'CONCLUIDO') {
            // Removendo faturamento caso mude de concluído para pendente/cancelado
            await financeiroRepo.deleteByAgendamentoId(id);
        } else if (oldAgendamento.status !== 'CONCLUIDO' && agendamentoData.status === 'CONCLUIDO') {
            // Adicionando faturamento
            await this._registrarReceita(id, agendamentoData);
        } else if (agendamentoData.status === 'CONCLUIDO') {
            // Se já era concluído, mas mudou preço/serviço/data, recria a receita para manter integridade
            await financeiroRepo.deleteByAgendamentoId(id);
            await this._registrarReceita(id, agendamentoData);
        }

        return result;
    }

    async atualizarStatus(id, status) {
        const oldAgendamento = await this.buscarPorId(id);
        if (oldAgendamento.status === status) return { changes: 0 };

        const result = await agendamentoRepo.updateStatus(id, status);

        // Sincronização financeira baseada em alteração de status simples
        if (oldAgendamento.status === 'CONCLUIDO' && status !== 'CONCLUIDO') {
            await financeiroRepo.deleteByAgendamentoId(id);
        } else if (oldAgendamento.status !== 'CONCLUIDO' && status === 'CONCLUIDO') {
            // Como atualizarStatus recebe apenas o ID, precisamos buscar os dados atuais para registrar a receita
            const current = await agendamentoRepo.findById(id);
            await this._registrarReceita(id, current);
        }

        return result;
    }

    async excluir(id) {
        await this.buscarPorId(id);
        // Deletar qualquer registro financeiro atrelado
        await financeiroRepo.deleteByAgendamentoId(id);
        return agendamentoRepo.delete(id);
    }

    // Auxiliar para registrar receita no financeiro
    async _registrarReceita(agendamentoId, agendamentoData) {
        try {
            // Obter detalhes dos modelos relacionados para montar a descrição
            const cliente = await clienteRepo.findById(agendamentoData.cliente_id);
            const colaborador = await colaboradorRepo.findById(agendamentoData.colaborador_id);
            const servico = await servicoRepo.findById(agendamentoData.servico_id);

            if (!cliente || !servico) {
                console.warn('Impossível registrar receita: Cliente ou Serviço não encontrados.');
                return;
            }

            const clienteNome = cliente.nome;
            const colaboradorNome = colaborador ? colaborador.nome : 'N/A';
            const servicoNome = servico.nome;
            const valor = servico.preco;

            // Data do agendamento (YYYY-MM-DD)
            const dataServico = agendamentoData.data_hora.split(' ')[0];

            await financeiroRepo.create({
                agendamento_id: agendamentoId,
                tipo: 'RECEITA',
                valor: valor,
                descricao: `Serviço: ${servicoNome} - Cliente: ${clienteNome} - Profissional: ${colaboradorNome}`,
                data: dataServico
            });
        } catch (err) {
            console.error('Falha ao registrar receita automática:', err.message);
        }
    }
}

module.exports = AgendamentoService;
