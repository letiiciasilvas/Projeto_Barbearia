// CONTROLE DO PORTAL DO CLIENTE
let selectedServiceId = null;
let cancelBookingId = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar nome do cliente no topo
    const user = getLoggedUser();
    if (user) {
        document.getElementById('clientName').innerText = user.nome;
    }

    // 2. Travar data mínima de agendamento como HOJE
    configurarDataMinimaBooking();

    // 3. Carregar dados do catálogo de serviços e dropdown de profissionais
    carregarServicosBooking();
    carregarColaboradoresBooking();

    // 4. Carregar histórico de agendamentos do cliente
    carregarMeusAgendamentos();

    // 5. Configurar envio do formulário de agendamento
    document.getElementById('formAgendamentoCliente').addEventListener('submit', salvarAgendamentoCliente);

    // 6. Configurar botão de confirmação de cancelamento
    document.getElementById('btnConfirmCancelClient').addEventListener('click', executarCancelamentoCliente);
});

// ==================== AUXILIARES DE INTERFACE ====================

function configurarDataMinimaBooking() {
    const inputDate = document.getElementById('bookingDataHora');
    const agora = new Date();
    // Ajustar fuso local para formato YYYY-MM-DDTHH:MM
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    
    inputDate.min = `${ano}-${mes}-${dia}T${horas}:${minutos}`;
}

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

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==================== REQUISIÇÕES & DADOS ====================

async function carregarServicosBooking() {
    try {
        const res = await fetch('/api/servicos', { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const grid = document.getElementById('bookingServicesGrid');
        grid.innerHTML = '';

        result.data.forEach(s => {
            const card = document.createElement('div');
            card.className = 'booking-service-card';
            card.setAttribute('data-id', s.id);
            
            const imgUrl = s.imagem || '/images/corte_masculino.webp';
            card.innerHTML = `
                <div class="booking-service-img" style="background-image: url('${imgUrl}')"></div>
                <h4>${s.nome}</h4>
                <span class="price">R$ ${Number(s.preco).toFixed(2)}</span>
                <span class="duration"><i class="fa-regular fa-clock"></i> ${s.duracao} min</span>
                <div class="selected-check">
                    <i class="fa-solid fa-check"></i>
                </div>
            `;

            // Evento de seleção de card
            card.addEventListener('click', () => {
                document.querySelectorAll('.booking-service-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedServiceId = s.id;
                document.getElementById('selectedServicoId').value = s.id;
            });

            grid.appendChild(card);
        });

    } catch (err) {
        showToast('Erro ao carregar serviços: ' + err.message, 'error');
    }
}

async function carregarColaboradoresBooking() {
    try {
        const res = await fetch('/api/colaboradores', { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const select = document.getElementById('bookingColaborador');
        select.innerHTML = '<option value="">Selecione um profissional...</option>';

        result.data.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nome} (${c.especialidade})</option>`;
        });

    } catch (err) {
        showToast('Erro ao carregar barbeiros: ' + err.message, 'error');
    }
}

async function carregarMeusAgendamentos() {
    try {
        const res = await fetch('/api/agendamentos', { headers: getAuthHeaders() });
        const result = await res.json();

        if (!result.success) throw new Error(result.message);

        const tbody = document.querySelector('#tableMeusAgendamentos tbody');
        tbody.innerHTML = '';

        if (result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Você ainda não realizou nenhum agendamento.</td></tr>`;
            return;
        }

        result.data.forEach(a => {
            const statusBadges = {
                PENDENTE: 'badge-pending',
                CONCLUIDO: 'badge-success',
                CANCELADO: 'badge-danger'
            };

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${a.servico ? a.servico.nome : 'N/A'}</strong></td>
                <td>R$ ${a.servico ? a.servico.preco.toFixed(2) : '0.00'}</td>
                <td>${a.colaborador ? a.colaborador.nome : 'N/A'}</td>
                <td>${formatarDataHora(a.data_hora)}</td>
                <td><span class="badge ${statusBadges[a.status] || 'badge-pending'}">${a.status}</span></td>
                <td>
                    ${a.status === 'PENDENTE' ? `
                        <button class="btn btn-danger btn-sm" onclick="openCancelModal(${a.id})">
                            <i class="fa-solid fa-ban"></i> Cancelar Horário
                        </button>
                    ` : '<span class="text-muted" style="font-size: 0.8rem;">Sem ações</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        showToast('Erro ao carregar seus agendamentos: ' + err.message, 'error');
    }
}

async function salvarAgendamentoCliente(e) {
    e.preventDefault();

    if (!selectedServiceId) {
        showToast('Por favor, clique em um dos serviços do Passo 1 para selecioná-lo.', 'error');
        return;
    }

    const colaborador_id = document.getElementById('bookingColaborador').value;
    const data_hora = document.getElementById('bookingDataHora').value;

    try {
        const res = await fetch('/api/agendamentos', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                colaborador_id,
                servico_id: selectedServiceId,
                data_hora
            })
        });

        const result = await res.json();

        if (!result.success) throw new Error(result.message || result.errors.join(', '));

        showToast('Seu horário foi agendado com sucesso!');
        
        // Resetar formulário
        document.getElementById('formAgendamentoCliente').reset();
        document.querySelectorAll('.booking-service-card').forEach(c => c.classList.remove('selected'));
        selectedServiceId = null;
        document.getElementById('selectedServicoId').value = '';

        // Recarregar listas
        carregarMeusAgendamentos();

    } catch (err) {
        showToast('Erro ao salvar agendamento: ' + err.message, 'error');
    }
}

// ==================== CANCELAMENTOS DO CLIENTE ====================

window.openCancelModal = function(id) {
    cancelBookingId = id;
    document.getElementById('modalCancelClient').classList.remove('d-none');
};

window.closeCancelModal = function() {
    cancelBookingId = null;
    document.getElementById('modalCancelClient').classList.add('d-none');
};

async function executarCancelamentoCliente() {
    if (!cancelBookingId) return;

    try {
        const res = await fetch(`/api/agendamentos/${cancelBookingId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: 'CANCELADO' })
        });

        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        showToast('Seu horário foi cancelado com sucesso.');
        closeCancelModal();
        carregarMeusAgendamentos();

    } catch (err) {
        showToast('Erro ao cancelar agendamento: ' + err.message, 'error');
        closeCancelModal();
    }
}

// ==================== FORMATADORES DE DATA ====================

function formatarDataHora(dataHoraStr) {
    if (!dataHoraStr) return '';
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
