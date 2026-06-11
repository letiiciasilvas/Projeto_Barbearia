const ClienteService = require('../service/ClienteService');
const ClienteDTO = require('../dto/ClienteDTO');

const clienteService = new ClienteService();

class ClienteController {
    async listar(req, res) {
        try {
            const searchQuery = req.query.search || '';
            const clientes = await clienteService.listarTodos(searchQuery);
            return res.status(200).json({ success: true, data: clientes });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            const cliente = await clienteService.buscarPorId(id);
            return res.status(200).json({ success: true, data: cliente });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    async criar(req, res) {
        try {
            const validation = ClienteDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            const result = await clienteService.criar(validation.data);
            return res.status(201).json({
                success: true,
                message: 'Cliente cadastrado com sucesso.',
                data: { id: result.id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validation = ClienteDTO.validate(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            await clienteService.atualizar(id, validation.data);
            return res.status(200).json({
                success: true,
                message: 'Cliente atualizado com sucesso.',
                data: { id, ...validation.data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async excluir(req, res) {
        try {
            const id = parseInt(req.params.id);
            await clienteService.excluir(id);
            return res.status(200).json({
                success: true,
                message: 'Cliente excluído com sucesso.'
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ClienteController;
