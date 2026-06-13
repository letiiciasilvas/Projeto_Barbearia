const FinanceiroService = require('../service/FinanceiroService');
const financeiroService = new FinanceiroService();

class FinanceiroController {
    async obterDashboard(req, res) {
        try {
            const data = await financeiroService.obterDadosDashboard();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async gerarRelatorio(req, res) {
        try {
            if (req.user && req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores podem gerar relatórios financeiros.' });
            }
            const { inicio, fim } = req.query;
            if (!inicio || !fim) {
                return res.status(400).json({
                    success: false,
                    message: 'Os parâmetros "inicio" e "fim" (no formato YYYY-MM-DD) são obrigatórios.'
                });
            }

            const relatorio = await financeiroService.gerarRelatorioPeriodo(inicio, fim);
            return res.status(200).json({ success: true, data: relatorio });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async listarTransacoes(req, res) {
        try {
            if (req.user && req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Acesso negado.' });
            }
            const searchQuery = req.query.search || '';
            const transacoes = await financeiroService.listarTodos(searchQuery);
            return res.status(200).json({ success: true, data: transacoes });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async criarDespesaReceita(req, res) {
        try {
            if (req.user && req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Acesso negado.' });
            }
            const { tipo, valor, descricao, data } = req.body;

            if (!tipo || !['RECEITA', 'DESPESA'].includes(tipo)) {
                return res.status(400).json({ success: false, message: 'O tipo deve ser RECEITA ou DESPESA.' });
            }

            const numericValor = parseFloat(valor);
            if (isNaN(numericValor) || numericValor <= 0) {
                return res.status(400).json({ success: false, message: 'O valor deve ser um número positivo.' });
            }

            if (!descricao || !descricao.trim()) {
                return res.status(400).json({ success: false, message: 'A descrição é obrigatória.' });
            }

            if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                return res.status(400).json({ success: false, message: 'A data deve estar no formato YYYY-MM-DD.' });
            }

            const result = await financeiroService.criar({
                tipo,
                valor: numericValor,
                descricao: descricao.trim(),
                data
            });

            return res.status(201).json({
                success: true,
                message: 'Registro financeiro criado com sucesso.',
                data: { id: result.id, tipo, valor: numericValor, descricao, data }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async excluirTransacao(req, res) {
        try {
            if (req.user && req.user.role !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Acesso negado.' });
            }
            const id = parseInt(req.params.id);
            await financeiroService.excluir(id);
            return res.status(200).json({
                success: true,
                message: 'Lançamento financeiro excluído com sucesso.'
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = FinanceiroController;
