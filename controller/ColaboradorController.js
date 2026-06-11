const ColaboradorService = require('../service/ColaboradorService');
const ColaboradorDTO = require('../dto/ColaboradorDTO');

const colaboradorService = new ColaboradorService();

class ColaboradorController {
    async listar(req, res) {
        try {
            const searchQuery = req.query.search || '';
            const colaboradores = await colaboradorService.listarTodos(searchQuery);
            return res.status(200).json({ success: true, data: colaboradores });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            const colaborador = await colaboradorService.buscarPorId(id);
            return res.status(200).json({ success: true, data: colaborador });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    async criar(req, res) {
        try {
            const validation = ColaboradorDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            const result = await colaboradorService.criar(validation.data);
            return res.status(201).json({
                success: true,
                message: 'Colaborador cadastrado com sucesso.',
                data: { id: result.id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validation = ColaboradorDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            await colaboradorService.atualizar(id, validation.data);
            return res.status(200).json({
                success: true,
                message: 'Colaborador atualizado com sucesso.',
                data: { id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async excluir(req, res) {
        try {
            const id = parseInt(req.params.id);
            await colaboradorService.excluir(id);
            return res.status(200).json({
                success: true,
                message: 'Colaborador excluído com sucesso.'
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ColaboradorController;
