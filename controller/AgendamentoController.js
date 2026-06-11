const AgendamentoService = require('../service/AgendamentoService');
const AgendamentoDTO = require('../dto/AgendamentoDTO');

const agendamentoService = new AgendamentoService();

class AgendamentoController {
    async listar(req, res) {
        try {
            const searchQuery = req.query.search || '';
            const agendamentos = await agendamentoService.listarTodos(searchQuery);
            return res.status(200).json({ success: true, data: agendamentos });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            const agendamento = await agendamentoService.buscarPorId(id);
            return res.status(200).json({ success: true, data: agendamento });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    async criar(req, res) {
        try {
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
