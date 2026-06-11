const ServicoService = require('../service/ServicoService');
const ServicoDTO = require('../dto/ServicoDTO');

const servicoService = new ServicoService();

class ServicoController {
    async listar(req, res) {
        try {
            const searchQuery = req.query.search || '';
            const servicos = await servicoService.listarTodos(searchQuery);
            return res.status(200).json({ success: true, data: servicos });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            const servico = await servicoService.buscarPorId(id);
            return res.status(200).json({ success: true, data: servico });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    async criar(req, res) {
        try {
            const validation = ServicoDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            const result = await servicoService.criar(validation.data);
            return res.status(201).json({
                success: true,
                message: 'Serviço cadastrado com sucesso.',
                data: { id: result.id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validation = ServicoDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            await servicoService.atualizar(id, validation.data);
            return res.status(200).json({
                success: true,
                message: 'Serviço atualizado com sucesso.',
                data: { id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async excluir(req, res) {
        try {
            const id = parseInt(req.params.id);
            await servicoService.excluir(id);
            return res.status(200).json({
                success: true,
                message: 'Serviço excluído com sucesso.'
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ServicoController;
