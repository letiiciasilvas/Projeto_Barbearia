# 💈 Sistema de Gestão - Barbearia Fio Da Navalha

Seja bem-vindo ao sistema de gestão integrado e faturamento para a **Barbearia Fio Da Navalha**. Este é um sistema completo, moderno e responsivo, desenvolvido sob a arquitetura **MVC (Model-View-Controller)** com separação limpa de responsabilidades utilizando Node.js, Express.js e banco de dados relacional SQLite.

---

## 🚀 Funcionalidades do Sistema

1. **Autenticação e Sessão Segura**:
   - Tela de login com design moderno (Glassmorphism), Dark Mode padrão e responsividade total.
   - Criptografia de senhas utilizando o algoritmo nativo `crypto.pbkdf2Sync` (zero falhas de ambiente).
   - Controle de sessão via **JSON Web Tokens (JWT)**.
2. **Dashboard Dinâmico (Tempo Real)**:
   - Indicadores integrados de: Total de Clientes, Colaboradores, Serviços Cadastrados, Agendamentos e Receitas Semanais/Mensais.
   - Histórico diário de faturamento em área gráfica (utilizando Chart.js).
   - Distribuição percentual de serviços mais realizados em gráfico de rosca (Chart.js).
   - Painel dinâmico dos próximos agendamentos com opções rápidas de Concluir ou Cancelar horários.
3. **CRUDs Completos com Busca Dinâmica**:
   - Módulos individuais para gerenciar **Clientes**, **Colaboradores**, **Serviços** e **Agendamentos**.
   - Criação, edição, exclusão e visualização de registros em janelas modais elegantes.
   - Pesquisa instantânea em todas as tabelas (busca dinâmica por Nome, Telefone, Serviço, Data e Status de forma simultânea via API).
4. **Relatórios Financeiros e Auditoria**:
   - Filtragem e detalhamento de receitas e despesas por período de datas personalizado.
   - Balanço do período com demonstrativos de Total de Receitas, Total de Despesas e Saldo Líquido.
   - Lançamento avulso de receitas ou despesas (ex: contas de luz, compras de insumos).
   - Exportação instantânea para planilha **CSV/Excel**.
   - Impressão otimizada em CSS (`@media print`) formatando relatórios limpos para salvamento direto em PDF.
5. **Automação Financeira**:
   - Ao alterar o status de qualquer agendamento para **CONCLUÍDO**, o sistema automaticamente registra o respectivo lançamento de **RECEITA** no caixa financeiro com auditoria de profissional, cliente e serviço. Caso o status seja alterado de volta ou excluído, a receita é sincronizada ou removida automaticamente.

---

## 📂 Estrutura do Projeto

O código do projeto foi estruturado seguindo as melhores práticas de Clean Architecture e DDD (Domain-Driven Design), dividido em:

```
Projeto_Barbearia/
├── config/
│   └── database.js            # Conexão, promisificação do SQLite e auto-seeding
├── database/
│   ├── fiodanavalha.db        # Banco de dados SQLite gerado na primeira execução
│   ├── schema.sql             # Definição de tabelas, chaves primárias e chaves estrangeiras
│   └── seed.sql               # Massa de dados padrão para testes imediatos
├── dto/
│   # Validação de payloads e saneamento de dados
│   ├── UserDTO.js
│   ├── ClienteDTO.js
│   ├── ColaboradorDTO.js
│   ├── ServicoDTO.js
│   └── AgendamentoDTO.js
├── model/
│   # Definições das entidades de negócio
│   ├── Usuario.js
│   ├── Cliente.js
│   ├── Colaborador.js
│   ├── Servico.js
│   ├── Agendamento.js
│   └── Financeiro.js
├── repository/
│   # Acesso direto e consultas SQL ao Banco de Dados (SQLite)
│   ├── BaseRepository.js
│   ├── UserRepository.js
│   ├── ClienteRepository.js
│   ├── ColaboradorRepository.js
│   ├── ServicoRepository.js
│   ├── AgendamentoRepository.js
│   └── FinanceiroRepository.js
├── service/
│   # Camada contendo todas as regras e integrações de negócio
│   ├── AuthService.js
│   ├── ClienteService.js
│   ├── ColaboradorService.js
│   ├── ServicoService.js
│   ├── AgendamentoService.js
│   └── FinanceiroService.js
├── controller/
│   # Tratamento de rotas HTTP, payloads e retornos da API REST
│   ├── AuthController.js
│   ├── ClienteController.js
│   ├── ColaboradorController.js
│   ├── ServicoController.js
│   ├── AgendamentoController.js
│   └── FinanceiroController.js
├── view/
│   # Interface do Usuário (Frontend SPA)
│   ├── css/
│   │   └── style.css          # Estilização completa Dark Mode Premium
│   ├── js/
│   │   ├── auth.js            # Validador de sessão no front-end
│   │   └── app.js             # Lógica do SPA, chamadas de API, filtros e gráficos
│   ├── index.html             # Arquivo inicial de redirecionamento
│   ├── login.html             # Tela de login
│   └── dashboard.html         # Shell principal do Dashboard SPA
├── server.js                  # Ponto de entrada do Express
├── package.json               # Configurações do npm e dependências
└── README.md                  # Manual do desenvolvedor
```

---

## 🛠️ Instruções de Instalação e Execução

### Pré-requisitos
- Ter o **Node.js** instalado (versão 18 ou superior recomendada).

### Passo a Passo

1. **Instalar Dependências**:
   Abra o terminal (PowerShell ou CMD) na pasta raiz do projeto e execute:
   ```bash
   npm install
   ```

2. **Iniciar o Servidor**:
   Para subir o servidor de desenvolvimento, execute:
   ```bash
   npm run dev
   ```

3. **Acessar o Sistema**:
   Abra seu navegador de preferência e acesse:
   ```
   http://localhost:3000
   ```

---

## 🔑 Credenciais Padrão de Acesso

Ao rodar o sistema pela primeira vez, o banco de dados SQLite será criado e populado automaticamente com os seguintes dados de acesso de teste:

| Nível de Acesso | E-mail | Senha |
| :--- | :--- | :--- |
| **Administrador** | `admin@fiodanavalha.com.br` | `admin123` |
| **Atendente/Operador** | `atendente@fiodanavalha.com.br` | `admin123` |

---

## 🔗 Enviando o Projeto para o Seu GitHub

O repositório Git local já foi inicializado e configurado na pasta do projeto. Para enviá-lo ao seu perfil pessoal do GitHub com o nome **Fio-Da-Navalha**, siga os passos abaixo:

1. Acesse sua conta no [GitHub](https://github.com/) e crie um **Novo Repositório** chamado exatamente `Fio-Da-Navalha` (deixe a opção "Initialize this repository with..." desmarcada).
2. Copie a URL HTTPS do seu novo repositório (ex: `https://github.com/SEU_USUARIO/Fio-Da-Navalha.git`).
3. No terminal do seu projeto local, vincule o repositório remoto e envie os commits criados executando os comandos a seguir:

```bash
# Adicionar o repositório remoto do GitHub
git remote add origin https://github.com/SEU_USUARIO/Fio-Da-Navalha.git

# Definir a branch padrão como 'main'
git branch -M main

# Enviar os arquivos para o GitHub
git push -u origin main
```

*(Caso seja solicitado, faça login no seu terminal com sua conta do GitHub ou insira seu token pessoal de acesso).*

---

## 📊 Endpoints da API REST (Resumo)

Todas as rotas da API (exceto login) exigem o cabeçalho HTTP `Authorization: Bearer <JWT_TOKEN>`.

### Autenticação
- `POST /api/auth/login` - Autentica usuário e retorna token JWT

### Clientes
- `GET /api/clientes` - Lista clientes (suporta filtro `?search=`)
- `GET /api/clientes/:id` - Detalha um cliente
- `POST /api/clientes` - Cadastra cliente
- `PUT /api/clientes/:id` - Edita cliente
- `DELETE /api/clientes/:id` - Exclui cliente

### Colaboradores (Barbeiros)
- `GET /api/colaboradores` - Lista colaboradores (suporta filtro `?search=`)
- `GET /api/colaboradores/:id` - Detalha colaborador
- `POST /api/colaboradores` - Cadastra colaborador
- `PUT /api/colaboradores/:id` - Edita colaborador
- `DELETE /api/colaboradores/:id` - Exclui colaborador

### Serviços
- `GET /api/servicos` - Lista serviços (suporta filtro `?search=`)
- `GET /api/servicos/:id` - Detalha serviço
- `POST /api/servicos` - Cadastra serviço
- `PUT /api/servicos/:id` - Edita serviço
- `DELETE /api/servicos/:id` - Exclui serviço

### Agendamentos
- `GET /api/agendamentos` - Lista agendamentos (suporta filtro `?search=`)
- `GET /api/agendamentos/:id` - Detalha agendamento
- `POST /api/agendamentos` - Cadastra agendamento
- `PUT /api/agendamentos/:id` - Edita agendamento
- `PUT /api/agendamentos/:id/status` - Altera status (PENDENTE, CONCLUIDO, CANCELADO)
- `DELETE /api/agendamentos/:id` - Exclui agendamento

### Financeiro & Relatórios
- `GET /api/financeiro/dashboard` - Retorna indicadores, gráficos e próximos atendimentos
- `GET /api/financeiro/relatorio` - Retorna resumo e lançamentos filtrados por período (`?inicio=YYYY-MM-DD&fim=YYYY-MM-DD`)
- `GET /api/financeiro/transacoes` - Lista lançamentos (suporta filtro `?search=`)
- `POST /api/financeiro/transacoes` - Registra receita/despesa avulsa
- `DELETE /api/financeiro/transacoes/:id` - Exclui lançamento financeiro avulso
