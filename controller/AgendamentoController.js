const AgendamentoService = require('../service/AgendamentoService');
const AgendamentoDTO = require('../dto/AgendamentoDTO');

const agendamentoService = new AgendamentoService();

class AgendamentoController {
    async listar(req, res) {
        try {
            const searchQuery = req.query.search || '';
            let agendamentos;

            if (req.user && req.user.role === 'CLIENTE') {
                agendamentos = await agendamentoService.listarPorCliente(req.user.cliente_id);
            } else if (req.user && req.user.role === 'ADMIN') {
                agendamentos = await agendamentoService.listarTodos(searchQuery);
            } else {
                return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores podem ver a lista de agendamentos.' });
            }

            return res.status(200).json({ success: true, data: agendamentos });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            const agendamento = await agendamentoService.buscarPorId(id);

            // Validar acesso se for cliente
            if (req.user && req.user.role === 'CLIENTE' && agendamento.cliente_id !== req.user.cliente_id) {
                return res.status(403).json({ success: false, message: 'Acesso negado.' });
            }

            return res.status(200).json({ success: true, data: agendamento });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    async criar(req, res) {
        try {
            // Se for cliente, injetar o cliente_id do token e status PENDENTE
            if (req.user && req.user.role === 'CLIENTE') {
                req.body.cliente_id = req.user.cliente_id;
                req.body.status = 'PENDENTE';
            }

            const validation = AgendamentoDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            const result = await agendamentoService.criar(validation.data);
            return res.status(201).json({
                success: true,
                message: 'Agendamento registrado com sucesso.',
                data: { id: result.id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Se for cliente, impedir alteração genérica (devem usar a rota de status para cancelar)
            if (req.user && req.user.role === 'CLIENTE') {
                return res.status(403).json({ success: false, message: 'Operação não permitida.' });
            }

            const validation = AgendamentoDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            await agendamentoService.atualizar(id, validation.data);
            return res.status(200).json({
                success: true,
                message: 'Agendamento atualizado com sucesso.',
                data: { id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async atualizarStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;

            if (!status || !['PENDENTE', 'CONCLUIDO', 'CANCELADO'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status inválido. Deve ser PENDENTE, CONCLUIDO ou CANCELADO.'
                });
            }

            // Validar se o cliente está cancelando seu próprio agendamento
            if (req.user && req.user.role === 'CLIENTE') {
                const agenda = await agendamentoService.buscarPorId(id);
                if (agenda.cliente_id !== req.user.cliente_id) {
                    return res.status(403).json({ success: false, message: 'Acesso negado. Este agendamento pertence a outro cliente.' });
                }
                if (status !== 'CANCELADO') {
                    return res.status(400).json({ success: false, message: 'Operação inválida. Clientes só podem cancelar agendamentos.' });
                }
            }

            await agendamentoService.atualizarStatus(id, status);
            return res.status(200).json({
                success: true,
                message: `Status do agendamento alterado para ${status} com sucesso.`
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async excluir(req, res) {
        try {
            const id = parseInt(req.params.id);

            // Impedir exclusão por clientes
            if (req.user && req.user.role === 'CLIENTE') {
                return res.status(403).json({ success: false, message: 'Operação não permitida para clientes.' });
            }

            await agendamentoService.excluir(id);
            return res.status(200).json({
                success: true,
                message: 'Agendamento excluído com sucesso.'
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = AgendamentoController;
