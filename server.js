const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/database');

// Importar Controllers
const AuthController = require('./controller/AuthController');
const ClienteController = require('./controller/ClienteController');
const ColaboradorController = require('./controller/ColaboradorController');
const ServicoController = require('./controller/ServicoController');
const AgendamentoController = require('./controller/AgendamentoController');
const FinanceiroController = require('./controller/FinanceiroController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (pasta view)
app.use(express.static(path.join(__dirname, 'view')));

// Instanciar Controllers
const authCtrl = new AuthController();
const clienteCtrl = new ClienteController();
const colabCtrl = new ColaboradorController();
const servicoCtrl = new ServicoController();
const agendCtrl = new AgendamentoController();
const finCtrl = new FinanceiroController();

// ==================== ROTAS DA API ====================

// --- Rotas Públicas ---
app.post('/api/auth/login', (req, res) => authCtrl.login(req, res));
app.post('/api/auth/register', (req, res) => authCtrl.register(req, res));

// --- Rotas Protegidas por JWT ---
const authMiddleware = AuthController.verificarTokenMiddleware;

// Clientes CRUD
app.get('/api/clientes', authMiddleware, (req, res) => clienteCtrl.listar(req, res));
app.get('/api/clientes/:id', authMiddleware, (req, res) => clienteCtrl.buscarPorId(req, res));
app.post('/api/clientes', authMiddleware, (req, res) => clienteCtrl.criar(req, res));
app.put('/api/clientes/:id', authMiddleware, (req, res) => clienteCtrl.atualizar(req, res));
app.delete('/api/clientes/:id', authMiddleware, (req, res) => clienteCtrl.excluir(req, res));

// Colaboradores CRUD
app.get('/api/colaboradores', authMiddleware, (req, res) => colabCtrl.listar(req, res));
app.get('/api/colaboradores/:id', authMiddleware, (req, res) => colabCtrl.buscarPorId(req, res));
app.post('/api/colaboradores', authMiddleware, (req, res) => colabCtrl.criar(req, res));
app.put('/api/colaboradores/:id', authMiddleware, (req, res) => colabCtrl.atualizar(req, res));
app.delete('/api/colaboradores/:id', authMiddleware, (req, res) => colabCtrl.excluir(req, res));

// Serviços CRUD
app.get('/api/servicos', authMiddleware, (req, res) => servicoCtrl.listar(req, res));
app.get('/api/servicos/:id', authMiddleware, (req, res) => servicoCtrl.buscarPorId(req, res));
app.post('/api/servicos', authMiddleware, (req, res) => servicoCtrl.criar(req, res));
app.put('/api/servicos/:id', authMiddleware, (req, res) => servicoCtrl.atualizar(req, res));
app.delete('/api/servicos/:id', authMiddleware, (req, res) => servicoCtrl.excluir(req, res));

// Agendamentos CRUD + Status
app.get('/api/agendamentos', authMiddleware, (req, res) => agendCtrl.listar(req, res));
app.get('/api/agendamentos/:id', authMiddleware, (req, res) => agendCtrl.buscarPorId(req, res));
app.post('/api/agendamentos', authMiddleware, (req, res) => agendCtrl.criar(req, res));
app.put('/api/agendamentos/:id', authMiddleware, (req, res) => agendCtrl.atualizar(req, res));
app.put('/api/agendamentos/:id/status', authMiddleware, (req, res) => agendCtrl.atualizarStatus(req, res));
app.delete('/api/agendamentos/:id', authMiddleware, (req, res) => agendCtrl.excluir(req, res));

// Financeiro e Dashboard
app.get('/api/financeiro/dashboard', authMiddleware, (req, res) => finCtrl.obterDashboard(req, res));
app.get('/api/financeiro/relatorio', authMiddleware, (req, res) => finCtrl.gerarRelatorio(req, res));
app.get('/api/financeiro/transacoes', authMiddleware, (req, res) => finCtrl.listarTransacoes(req, res));
app.post('/api/financeiro/transacoes', authMiddleware, (req, res) => finCtrl.criarDespesaReceita(req, res));
app.delete('/api/financeiro/transacoes/:id', authMiddleware, (req, res) => finCtrl.excluirTransacao(req, res));

// ==================== TRATAMENTO DE ERROS / FRONTEND ROTAS ====================

// Qualquer outra rota não mapeada redireciona para a home/dashboard.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

// Middleware genérico para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Ocorreu um erro interno no servidor.'
    });
});

// Inicializar banco de dados e subir servidor
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`===================================================`);
        console.log(` BARBEARIA FIO DA NAVALHA - SISTEMA DE GESTÃO      `);
        console.log(` Servidor rodando em: http://localhost:${PORT}      `);
        console.log(`===================================================`);
    });
});
