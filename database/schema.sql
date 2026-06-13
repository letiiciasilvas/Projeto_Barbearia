-- Habilitar integridade de chaves estrangeiras
PRAGMA foreign_keys = ON;

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários (Acesso ao Sistema)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL, -- Hash PBKDF2
    role TEXT NOT NULL DEFAULT 'OPERADOR', -- 'ADMIN', 'OPERADOR' ou 'CLIENTE'
    cliente_id INTEGER, -- Associado apenas se role = 'CLIENTE'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de Colaboradores (Barbeiros)
CREATE TABLE IF NOT EXISTS colaboradores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    especialidade TEXT NOT NULL, -- Ex: 'Cabelo', 'Barba', 'Completo'
    telefone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    duracao INTEGER NOT NULL, -- Duração em minutos
    imagem TEXT, -- Caminho relativo para a foto do serviço
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    colaborador_id INTEGER NOT NULL,
    servico_id INTEGER NOT NULL,
    data_hora DATETIME NOT NULL, -- Formato 'YYYY-MM-DD HH:MM:SS'
    status TEXT NOT NULL CHECK(status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO')) DEFAULT 'PENDENTE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
);

-- Tabela de Financeiro (Faturamento e Despesas)
CREATE TABLE IF NOT EXISTS financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agendamento_id INTEGER, -- Opcional, caso a receita venha de um agendamento
    tipo TEXT NOT NULL CHECK(tipo IN ('RECEITA', 'DESPESA')),
    valor REAL NOT NULL,
    descricao TEXT NOT NULL,
    data DATE NOT NULL, -- Formato 'YYYY-MM-DD'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL
);
