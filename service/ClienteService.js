const ClienteRepository = require('../repository/ClienteRepository');
const clienteRepo = new ClienteRepository();

class ClienteService {
    async listarTodos(searchQuery = '') {
        return clienteRepo.findAll(searchQuery);
    }

    async buscarPorId(id) {
        const cliente = await clienteRepo.findById(id);
        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }
        return cliente;
    }

    async criar(clienteData) {
        return clienteRepo.create(clienteData);
    }

    async atualizar(id, clienteData) {
        await this.buscarPorId(id); // Valida existência
        return clienteRepo.update(id, clienteData);
    }

    async excluir(id) {
        await this.buscarPorId(id); // Valida existência
        return clienteRepo.delete(id);
    }
}

module.exports = ClienteService;
