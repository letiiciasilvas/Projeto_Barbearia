const ColaboradorRepository = require('../repository/ColaboradorRepository');
const colaboradorRepo = new ColaboradorRepository();

class ColaboradorService {
    async listarTodos(searchQuery = '') {
        return colaboradorRepo.findAll(searchQuery);
    }

    async buscarPorId(id) {
        const colaborador = await colaboradorRepo.findById(id);
        if (!colaborador) {
            throw new Error('Colaborador não encontrado.');
        }
        return colaborador;
    }

    async criar(colaboradorData) {
        return colaboradorRepo.create(colaboradorData);
    }

    async atualizar(id, colaboradorData) {
        await this.buscarPorId(id);
        return colaboradorRepo.update(id, colaboradorData);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return colaboradorRepo.delete(id);
    }
}

module.exports = ColaboradorService;
