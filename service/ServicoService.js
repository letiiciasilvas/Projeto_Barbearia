const ServicoRepository = require('../repository/ServicoRepository');
const servicoRepo = new ServicoRepository();

class ServicoService {
    async listarTodos(searchQuery = '') {
        return servicoRepo.findAll(searchQuery);
    }

    async buscarPorId(id) {
        const servico = await servicoRepo.findById(id);
        if (!servico) {
            throw new Error('Serviço não encontrado.');
        }
        return servico;
    }

    async criar(servicoData) {
        return servicoRepo.create(servicoData);
    }

    async atualizar(id, servicoData) {
        await this.buscarPorId(id);
        return servicoRepo.update(id, servicoData);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return servicoRepo.delete(id);
    }
}

module.exports = ServicoService;
