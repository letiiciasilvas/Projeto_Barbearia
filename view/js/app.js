// CONFIGURAÇÕES E ESTADO DO CLIENTE
const API_URL = ''; // Rotas locais relativas
let currentTab = 'dashboard';
let charts = {}; // Guarda instâncias dos gráficos Chart.js
let deleteContext = { table: null, id: null }; // Controle de exclusão ativa

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Definir nome e cargo no perfil do sidebar
    const user = getLoggedUser();
    if (user) {
        document.getElementById('profileName').innerText = user.nome;
        document.getElementById('profileRole').innerText = user.role === 'ADMIN' ? 'Administrador' : 'Atendente';
    }

    // Configurar a data de hoje no header
    configurarDataHoje();

    // Eventos de Navegação do Sidebar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Toggle Sidebar no Mobile
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');
    const sidebar = document.getElementById('sidebar');

    btnToggleSidebar.addEventListener('click', () => sidebar.classList.add('active'));
    btnCloseSidebar.addEventListener('click', () => sidebar.classList.remove('active'));

    // Configurar Inputs de busca dinâmica com Debounce
    configurarPesquisasDinamicas();

    // Configurar Submissão de Formulários CRUD
    configurarFormularios();

    // Botão de Confirmação de Exclusão
    document.getElementById('btnConfirmDelete').addEventListener('click', executarExclusao);

    // Definir datas iniciais para Relatórios (Mês Atual)
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    document.getElementById('reportDateStart').value = primeiroDia.toISOString().split('T')[0];
    document.getElementById('reportDateEnd').value = hoje.toISOString().split('T')[0];

    // Carregar a aba padrão
    switchTab('dashboard');
});

// ==================== AUXILIARES GERAIS ====================

function configurarDataHoje() {
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const d = new Date();
    const textoDate = `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
    document.getElementById('headerDate').innerText = textoDate;
}

// Alternar abas (SPA)
function switchTab(tabName) {
    currentTab = tabName;

    // Atualizar menu sidebar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Alternar visibilidade dos painéis
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => panel.classList.add('d-none'));
    document.getElementById(`tab-${tabName}`).classList.remove('d-none');

    // Fechar sidebar no mobile se estiver ativa
    document.getElementById('sidebar').classList.remove('active');

    // Atualizar título da página
    const titulos = {
        dashboard: 'Dashboard',
        clientes: 'Gestão de Clientes',
        colaboradores: 'Gestão de Colaboradores',
        servicos: 'Gestão de Serviços',
        agendamentos: 'Gestão de Agendamentos',
        relatorios: 'Financeiro & Relatórios'
    };
    document.getElementById('pageTitle').innerText = titulos[tabName] || 'Painel';

    // Carregar dados específicos da aba ativa
    carregarDadosAba(tabName);
}

// Direcionador de carregamento de dados
function carregarDadosAba(tabName) {
    switch (tabName) {
        case 'dashboard':
            carregarDashboard();
            break;
        case 'clientes':
            carregarClientes();
            break;
        case 'colaboradores':
            carregarColaboradores();
            break;
        case 'servicos':
            carregarServicos();
            break;
        case 'agendamentos':
            carregarAgendamentos();
            break;
        case 'relatorios':
            gerarRelatorioFinanceiro();
            break;
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Sumir e remover do DOM
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Modais - Abrir e Fechar
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('d-none');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('d-none');
}

// Debounce para pesquisas dinâmicas
let searchTimeout;
function configurarPesquisasDinamicas() {
    const inputs = [
        { id: 'searchClientes', handler: carregarClientes },
        { id: 'searchColaboradores', handler: carregarColaboradores },
        { id: 'searchServicos', handler: carregarServicos },
        { id: 'searchAgendamentos', handler: carregarAgendamentos }
    ];

    inputs.forEach(item => {
        const inputElement = document.getElementById(item.id);
        if (inputElement) {
            inputElement.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    item.handler(inputElement.value);
                }, 400); // 400ms delay para não sobrecarregar
            });
        }
    });
}

// ==================== DASHBOARD CARREGAMENTO ====================

async function carregarDashboard() {
    try {
        const res = await fetch('/api/financeiro/dashboard', { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const d = result.data;

        // Atualizar indicadores nos cards
        document.getElementById('cardClientes').innerText = d.indicadores.totalClientes;
        document.getElementById('cardColaboradores').innerText = d.indicadores.totalColaboradores;
        document.getElementById('cardServicos').innerText = d.indicadores.totalServicos;
        document.getElementById('cardAgendamentos').innerText = d.indicadores.totalAgendamentos;
        document.getElementById('cardReceitaSemanal').innerText = formatarMoeda(d.indicadores.receitaSemanal);
        document.getElementById('cardReceitaMensal').innerText = formatarMoeda(d.indicadores.receitaMensal);

        // Alimentar Tabela de Próximos Agendamentos
        const tbody = document.querySelector('#tableProximosAgendamentos tbody');
        tbody.innerHTML = '';

        if (d.proximosAgendamentos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum agendamento pendente para hoje ou próximos dias.</td></tr>`;
        } else {
            d.proximosAgendamentos.forEach(a => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${a.cliente ? a.cliente.nome : 'N/A'}</strong></td>
                    <td>${a.cliente ? a.cliente.telefone : 'N/A'}</td>
                    <td>${a.colaborador ? a.colaborador.nome : 'N/A'}</td>
                    <td><span class="badge badge-pending">${a.servico ? a.servico.nome : 'N/A'}</span></td>
                    <td>${formatarDataHora(a.data_hora)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon-only btn-success-icon" onclick="alterarStatusAgendamentoRapido(${a.id}, 'CONCLUIDO')" title="Concluir Atendimento">
                                <i class="fa-solid fa-check"></i>
                            </button>
                            <button class="btn-icon-only btn-delete" onclick="alterarStatusAgendamentoRapido(${a.id}, 'CANCELADO')" title="Cancelar Horário">
                                <i class="fa-solid fa-ban"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Renderizar Gráficos Chart.js
        renderizarGraficos(d.graficos);

    } catch (err) {
        showToast('Erro ao carregar dashboard: ' + err.message, 'error');
    }
}

function renderizarGraficos(graficosData) {
    // 1. Gráfico de Linha/Área - Faturamento
    if (charts.faturamento) charts.faturamento.destroy();

    const hist = graficosData.historicoFaturamento;
    const labelsFaturamento = hist.map(h => formatarDataGrafico(h.data));
    const valoresFaturamento = hist.map(h => h.valor);

    const ctxFaturamento = document.getElementById('chartFaturamento').getContext('2d');
    charts.faturamento = new Chart(ctxFaturamento, {
        type: 'line',
        data: {
            labels: labelsFaturamento.length ? labelsFaturamento : ['Sem dados'],
            datasets: [{
                label: 'Receita Diária',
                data: valoresFaturamento.length ? valoresFaturamento : [0],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });

    // 2. Gráfico Doughnut - Serviços Mais Realizados
    if (charts.servicos) charts.servicos.destroy();

    const servs = graficosData.servicosMaisRealizados;
    const labelsServicos = servs.map(s => s.servico);
    const valoresServicos = servs.map(s => s.quantidade);

    const ctxServicos = document.getElementById('chartServicosPopulares').getContext('2d');
    charts.servicos = new Chart(ctxServicos, {
        type: 'doughnut',
        data: {
            labels: labelsServicos.length ? labelsServicos : ['Nenhum concluído'],
            datasets: [{
                data: valoresServicos.length ? valoresServicos : [1],
                backgroundColor: ['#38bdf8', '#6366f1', '#06b6d4', '#a855f7', '#10b981'],
                borderWidth: 1,
                borderColor: '#111827'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } }
                }
            }
        }
    });
}

// ==================== CLIENTES CRUD ====================

async function carregarClientes(search = '') {
    try {
        const res = await fetch(`/api/clientes?search=${encodeURIComponent(search)}`, { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const tbody = document.querySelector('#tableClientes tbody');
        tbody.innerHTML = '';

        if (result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum cliente cadastrado.</td></tr>`;
            return;
        }

        result.data.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.nome}</strong></td>
                <td>${c.telefone}</td>
                <td>${c.email || '<span class="text-muted">Não informado</span>'}</td>
                <td>${formatarDataHora(c.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon-only btn-edit" onclick="editarCliente(${JSON.stringify(c).replace(/"/g, '&quot;')})" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icon-only btn-delete" onclick="confirmarExclusao('clientes', ${c.id})" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        showToast('Erro ao carregar clientes: ' + err.message, 'error');
    }
}

function openClienteModal(cliente = null) {
    const title = document.getElementById('clienteModalTitle');
    const form = document.getElementById('formCliente');
    
    form.reset();
    document.getElementById('clienteId').value = '';

    if (cliente) {
        title.innerText = 'Editar Cliente';
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('clienteNome').value = cliente.nome;
        document.getElementById('clienteTelefone').value = cliente.telefone;
        document.getElementById('clienteEmail').value = cliente.email || '';
    } else {
        title.innerText = 'Novo Cliente';
    }

    openModal('modalCliente');
}

// ==================== COLABORADORES CRUD ====================

async function carregarColaboradores(search = '') {
    try {
        const res = await fetch(`/api/colaboradores?search=${encodeURIComponent(search)}`, { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const tbody = document.querySelector('#tableColaboradores tbody');
        tbody.innerHTML = '';

        if (result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum colaborador cadastrado.</td></tr>`;
            return;
        }

        result.data.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.nome}</strong></td>
                <td><span class="badge badge-pending">${c.especialidade}</span></td>
                <td>${c.telefone}</td>
                <td>${formatarDataHora(c.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon-only btn-edit" onclick="editarColaborador(${JSON.stringify(c).replace(/"/g, '&quot;')})" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icon-only btn-delete" onclick="confirmarExclusao('colaboradores', ${c.id})" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        showToast('Erro ao carregar colaboradores: ' + err.message, 'error');
    }
}

function openColaboradorModal(colab = null) {
    const title = document.getElementById('colaboradorModalTitle');
    const form = document.getElementById('formColaborador');
    
    form.reset();
    document.getElementById('colaboradorId').value = '';

    if (colab) {
        title.innerText = 'Editar Colaborador';
        document.getElementById('colaboradorId').value = colab.id;
        document.getElementById('colaboradorNome').value = colab.nome;
        document.getElementById('colaboradorEspecialidade').value = colab.especialidade;
        document.getElementById('colaboradorTelefone').value = colab.telefone;
    } else {
        title.innerText = 'Novo Colaborador';
    }

    openModal('modalColaborador');
}

// ==================== SERVIÇOS CRUD ====================

async function carregarServicos(search = '') {
    try {
        const res = await fetch(`/api/servicos?search=${encodeURIComponent(search)}`, { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const tbody = document.querySelector('#tableServicos tbody');
        tbody.innerHTML = '';

        if (result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum serviço cadastrado.</td></tr>`;
            return;
        }

        result.data.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${s.nome}</strong></td>
                <td><strong>${formatarMoeda(s.preco)}</strong></td>
                <td><i class="fa-regular fa-clock"></i> ${s.duracao} minutos</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon-only btn-edit" onclick="editarServico(${JSON.stringify(s).replace(/"/g, '&quot;')})" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icon-only btn-delete" onclick="confirmarExclusao('servicos', ${s.id})" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        showToast('Erro ao carregar serviços: ' + err.message, 'error');
    }
}

function openServicoModal(serv = null) {
    const title = document.getElementById('servicoModalTitle');
    const form = document.getElementById('formServico');
    
    form.reset();
    document.getElementById('servicoId').value = '';

    if (serv) {
        title.innerText = 'Editar Serviço';
        document.getElementById('servicoId').value = serv.id;
        document.getElementById('servicoNome').value = serv.nome;
        document.getElementById('servicoPreco').value = serv.preco;
        document.getElementById('servicoDuracao').value = serv.duracao;
    } else {
        title.innerText = 'Novo Serviço';
    }

    openModal('modalServico');
}

// ==================== AGENDAMENTOS CRUD ====================

async function carregarAgendamentos(search = '') {
    try {
        const res = await fetch(`/api/agendamentos?search=${encodeURIComponent(search)}`, { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const tbody = document.querySelector('#tableAgendamentos tbody');
        tbody.innerHTML = '';

        if (result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum agendamento encontrado.</td></tr>`;
            return;
        }

        result.data.forEach(a => {
            const statusBadges = {
                PENDENTE: 'badge-pending',
                CONCLUIDO: 'badge-success',
                CANCELADO: 'badge-danger'
            };
            
            const badgeClass = statusBadges[a.status] || 'badge-pending';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${a.cliente ? a.cliente.nome : 'N/A'}</strong><br><small class="text-muted">${a.cliente ? a.cliente.telefone : ''}</small></td>
                <td>${a.colaborador ? a.colaborador.nome : 'N/A'}</td>
                <td>${a.servico ? a.servico.nome : 'N/A'}<br><small class="text-muted">${a.servico ? formatarMoeda(a.servico.preco) : ''}</small></td>
                <td>${formatarDataHora(a.data_hora)}</td>
                <td><span class="badge ${badgeClass}">${a.status}</span></td>
                <td>
                    <div class="action-buttons">
                        ${a.status === 'PENDENTE' ? `
                        <button class="btn-icon-only btn-success-icon" onclick="alterarStatusAgendamento(${a.id}, 'CONCLUIDO')" title="Concluir Atendimento">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button class="btn-icon-only btn-secondary" onclick="alterarStatusAgendamento(${a.id}, 'CANCELADO')" title="Cancelar">
                            <i class="fa-solid fa-ban"></i>
                        </button>
                        ` : ''}
                        <button class="btn-icon-only btn-edit" onclick="editarAgendamento(${JSON.stringify(a).replace(/"/g, '&quot;')})" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icon-only btn-delete" onclick="confirmarExclusao('agendamentos', ${a.id})" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        showToast('Erro ao carregar agendamentos: ' + err.message, 'error');
    }
}

async function openAgendamentoModal(a = null) {
    const title = document.getElementById('agendamentoModalTitle');
    const form = document.getElementById('formAgendamento');
    const statusGroup = document.getElementById('statusGroup');
    
    form.reset();
    document.getElementById('agendamentoId').value = '';

    // Carregar selects dinâmicos
    await carregarSelectsAgendamento();

    if (a) {
        title.innerText = 'Editar Agendamento';
        statusGroup.classList.remove('d-none'); // Mostrar campo de status apenas na edição
        
        document.getElementById('agendamentoId').value = a.id;
        document.getElementById('agendamentoCliente').value = a.cliente_id;
        document.getElementById('agendamentoColaborador').value = a.colaborador_id;
        document.getElementById('agendamentoServico').value = a.servico_id;
        
        // Ajustar formato de data 'YYYY-MM-DD HH:MM:SS' -> 'YYYY-MM-DDTHH:MM' para o input datetime-local
        if (a.data_hora) {
            document.getElementById('agendamentoDataHora').value = a.data_hora.replace(' ', 'T').substring(0, 16);
        }
        
        document.getElementById('agendamentoStatus').value = a.status;
    } else {
        title.innerText = 'Novo Agendamento';
        statusGroup.classList.add('d-none'); // Ocultar status no cadastro (nasce PENDENTE)
        document.getElementById('agendamentoStatus').value = 'PENDENTE';
    }

    openModal('modalAgendamento');
}

// Carrega os dados de clientes, barbeiros e serviços para povoar os dropdowns no modal de agendamentos
async function carregarSelectsAgendamento() {
    try {
        const [resClientes, resColabs, resServicos] = await Promise.all([
            fetch('/api/clientes', { headers: getAuthHeaders() }),
            fetch('/api/colaboradores', { headers: getAuthHeaders() }),
            fetch('/api/servicos', { headers: getAuthHeaders() })
        ]);

        const [c, col, s] = await Promise.all([
            resClientes.json(),
            resColabs.json(),
            resServicos.json()
        ]);

        // Popular Cliente Select
        const selectCliente = document.getElementById('agendamentoCliente');
        selectCliente.innerHTML = '<option value="">Selecione um cliente...</option>';
        c.data.forEach(item => {
            selectCliente.innerHTML += `<option value="${item.id}">${item.nome} (${item.telefone})</option>`;
        });

        // Popular Colaborador Select
        const selectColab = document.getElementById('agendamentoColaborador');
        selectColab.innerHTML = '<option value="">Selecione um profissional...</option>';
        col.data.forEach(item => {
            selectColab.innerHTML += `<option value="${item.id}">${item.nome} - ${item.especialidade}</option>`;
        });

        // Popular Serviço Select
        const selectServico = document.getElementById('agendamentoServico');
        selectServico.innerHTML = '<option value="">Selecione um serviço...</option>';
        s.data.forEach(item => {
            selectServico.innerHTML += `<option value="${item.id}">${item.nome} - R$ ${item.preco.toFixed(2)}</option>`;
        });

    } catch (err) {
        showToast('Erro ao carregar opções para agendamento: ' + err.message, 'error');
    }
}

// Alteração de status rápida do dashboard
async function alterarStatusAgendamentoRapido(id, status) {
    await alterarStatusAgendamento(id, status);
    // Recarregar dashboard para atualizar tabelas e gráficos
    carregarDashboard();
}

async function alterarStatusAgendamento(id, status) {
    try {
        const res = await fetch(`/api/agendamentos/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        showToast(`Agendamento marcado como ${status}!`);
        if (currentTab === 'agendamentos') {
            carregarAgendamentos();
        }
    } catch (err) {
        showToast('Erro ao atualizar status: ' + err.message, 'error');
    }
}

// ==================== RELATÓRIOS & FINANCEIRO ====================

async function gerarRelatorioFinanceiro() {
    const inicio = document.getElementById('reportDateStart').value;
    const fim = document.getElementById('reportDateEnd').value;

    if (!inicio || !fim) {
        showToast('Por favor, informe a data início e fim.', 'error');
        return;
    }

    try {
        const res = await fetch(`/api/financeiro/relatorio?inicio=${inicio}&fim=${fim}`, { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const d = result.data;

        // Atualizar indicadores do relatório
        document.getElementById('reportReceitas').innerText = formatarMoeda(d.resumo.receitas);
        document.getElementById('reportDespesas').innerText = formatarMoeda(d.resumo.despesas);
        
        const saldoEl = document.getElementById('reportSaldo');
        saldoEl.innerText = formatarMoeda(d.resumo.saldo);
        if (d.resumo.saldo >= 0) {
            saldoEl.className = 'financial-value text-green';
        } else {
            saldoEl.className = 'financial-value text-red';
        }

        // Popular Tabela Financeira
        const tbody = document.querySelector('#tableFinanceiro tbody');
        tbody.innerHTML = '';

        if (d.transacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhuma transação encontrada no período.</td></tr>`;
            return;
        }

        d.transacoes.forEach(t => {
            const badgeClass = t.tipo === 'RECEITA' ? 'badge-success' : 'badge-danger';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatarDataSimples(t.data)}</td>
                <td><span class="badge ${badgeClass}">${t.tipo}</span></td>
                <td>${t.descricao}</td>
                <td><strong>${formatarMoeda(t.valor)}</strong></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon-only btn-delete" onclick="confirmarExclusao('financeiro', ${t.id})" title="Excluir Transação">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        showToast('Erro ao carregar relatório: ' + err.message, 'error');
    }
}

function openFinanceiroModal(tipo) {
    document.getElementById('formFinanceiro').reset();
    document.getElementById('financeiroTipo').value = tipo;
    
    const title = document.getElementById('financeiroModalTitle');
    title.innerText = tipo === 'RECEITA' ? 'Nova Receita Avulsa' : 'Nova Despesa / Gasto';

    // Setar data padrão como hoje
    document.getElementById('financeiroData').value = new Date().toISOString().split('T')[0];

    openModal('modalFinanceiro');
}

function exportarRelatorioCSV() {
    const table = document.getElementById('tableFinanceiro');
    let csv = [];
    
    // Adicionar cabeçalho do faturamento
    const receitas = document.getElementById('reportReceitas').innerText;
    const despesas = document.getElementById('reportDespesas').innerText;
    const saldo = document.getElementById('reportSaldo').innerText;
    const inicio = document.getElementById('reportDateStart').value;
    const fim = document.getElementById('reportDateEnd').value;
    
    csv.push(`Relatorio Financeiro de ${formatarDataSimples(inicio)} ate ${formatarDataSimples(fim)}`);
    csv.push(`Receitas Totais;${receitas}`);
    csv.push(`Despesas Totais;${despesas}`);
    csv.push(`Saldo Liquido;${saldo}`);
    csv.push(''); // linha em branco

    // Obter dados da tabela
    const rows = table.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length - 1; j++) { // Pula a coluna de ações (última)
            // Remover quebras de linha e ponto e vírgula
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/;/g, ',');
            row.push(data);
        }
        
        csv.push(row.join(';'));
    }

    // Criar download
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fio_da_Navalha_Financeiro_${inicio}_a_${fim}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function imprimirRelatorio() {
    window.print();
}

// ==================== SUBMISSÃO E PERSISTÊNCIA CRUD (POST/PUT/DELETE) ====================

function configurarFormularios() {
    // 1. Cliente Submit
    document.getElementById('formCliente').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('clienteId').value;
        const nome = document.getElementById('clienteNome').value.trim();
        const telefone = document.getElementById('clienteTelefone').value.trim();
        const email = document.getElementById('clienteEmail').value.trim();

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/clientes/${id}` : '/api/clientes';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ nome, telefone, email })
            });
            const result = await res.json();

            if (!result.success) throw new Error(result.message || result.errors.join(', '));

            showToast(result.message);
            closeModal('modalCliente');
            carregarClientes();
        } catch (err) {
            showToast('Erro ao salvar cliente: ' + err.message, 'error');
        }
    });

    // 2. Colaborador Submit
    document.getElementById('formColaborador').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('colaboradorId').value;
        const nome = document.getElementById('colaboradorNome').value.trim();
        const especialidade = document.getElementById('colaboradorEspecialidade').value.trim();
        const telefone = document.getElementById('colaboradorTelefone').value.trim();

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/colaboradores/${id}` : '/api/colaboradores';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ nome, especialidade, telefone })
            });
            const result = await res.json();

            if (!result.success) throw new Error(result.message || result.errors.join(', '));

            showToast(result.message);
            closeModal('modalColaborador');
            carregarColaboradores();
        } catch (err) {
            showToast('Erro ao salvar colaborador: ' + err.message, 'error');
        }
    });

    // 3. Serviço Submit
    document.getElementById('formServico').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('servicoId').value;
        const nome = document.getElementById('servicoNome').value.trim();
        const preco = document.getElementById('servicoPreco').value;
        const duracao = document.getElementById('servicoDuracao').value;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/servicos/${id}` : '/api/servicos';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ nome, preco, duracao })
            });
            const result = await res.json();

            if (!result.success) throw new Error(result.message || result.errors.join(', '));

            showToast(result.message);
            closeModal('modalServico');
            carregarServicos();
        } catch (err) {
            showToast('Erro ao salvar serviço: ' + err.message, 'error');
        }
    });

    // 4. Agendamento Submit
    document.getElementById('formAgendamento').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('agendamentoId').value;
        const cliente_id = document.getElementById('agendamentoCliente').value;
        const colaborador_id = document.getElementById('agendamentoColaborador').value;
        const servico_id = document.getElementById('agendamentoServico').value;
        const data_hora = document.getElementById('agendamentoDataHora').value;
        const status = document.getElementById('agendamentoStatus').value;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/agendamentos/${id}` : '/api/agendamentos';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ cliente_id, colaborador_id, servico_id, data_hora, status })
            });
            const result = await res.json();

            if (!result.success) throw new Error(result.message || result.errors.join(', '));

            showToast(result.message);
            closeModal('modalAgendamento');
            carregarAgendamentos();
        } catch (err) {
            showToast('Erro ao salvar agendamento: ' + err.message, 'error');
        }
    });

    // 5. Lançamento Financeiro Avulso Submit
    document.getElementById('formFinanceiro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.getElementById('financeiroTipo').value;
        const descricao = document.getElementById('financeiroDescricao').value.trim();
        const valor = document.getElementById('financeiroValor').value;
        const data = document.getElementById('financeiroData').value;

        try {
            const res = await fetch('/api/financeiro/transacoes', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ tipo, descricao, valor, data })
            });
            const result = await res.json();

            if (!result.success) throw new Error(result.message);

            showToast(result.message);
            closeModal('modalFinanceiro');
            gerarRelatorioFinanceiro(); // Atualiza a aba relatórios
        } catch (err) {
            showToast('Erro ao salvar movimentação: ' + err.message, 'error');
        }
    });
}

// Lógica de Exclusão unificada
function confirmarExclusao(tableName, id) {
    deleteContext.table = tableName;
    deleteContext.id = id;
    openModal('modalDelete');
}

async function executarExclusao() {
    const { table, id } = deleteContext;
    if (!table || !id) return;

    let url = '';
    if (table === 'clientes') url = `/api/clientes/${id}`;
    if (table === 'colaboradores') url = `/api/colaboradores/${id}`;
    if (table === 'servicos') url = `/api/servicos/${id}`;
    if (table === 'agendamentos') url = `/api/agendamentos/${id}`;
    if (table === 'financeiro') url = `/api/financeiro/transacoes/${id}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        showToast(result.message);
        closeModal('modalDelete');

        // Recarregar os dados corretos conforme a tabela excluída
        if (table === 'clientes') carregarClientes();
        if (table === 'colaboradores') carregarColaboradores();
        if (table === 'servicos') carregarServicos();
        if (table === 'agendamentos') carregarAgendamentos();
        if (table === 'financeiro') gerarRelatorioFinanceiro();

    } catch (err) {
        showToast('Erro ao excluir registro: ' + err.message, 'error');
        closeModal('modalDelete');
    }
}

// ==================== MÉTODOS DE ATRIBUIÇÃO AUXILIAR DE EDIÇÃO EM WINDOWS ====================

// Copia dados pro modal para editar
window.editarCliente = function(cliente) {
    openClienteModal(cliente);
};

window.editarColaborador = function(colab) {
    openColaboradorModal(colab);
};

window.editarServico = function(serv) {
    openServicoModal(serv);
};

window.editarAgendamento = function(a) {
    openAgendamentoModal(a);
};

// ==================== FORMATADORES DE DADOS ====================

function formatarMoeda(valor) {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarDataHora(dataHoraStr) {
    if (!dataHoraStr) return '';
    // Entrada: 'YYYY-MM-DD HH:MM:SS'
    // Converter para objeto Date
    const parts = dataHoraStr.split(' ');
    const dateParts = parts[0].split('-');
    const timeParts = parts[1] ? parts[1].split(':') : ['00', '00'];

    const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
    
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${d.getFullYear()} às ${hora}:${min}`;
}

function formatarDataSimples(dataStr) {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    if (parts.length !== 3) return dataStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatarDataGrafico(dataStr) {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    if (parts.length !== 3) return dataStr;
    return `${parts[2]}/${parts[1]}`; // Retorna DD/MM
}
