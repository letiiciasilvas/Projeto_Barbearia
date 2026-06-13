-- Limpar tabelas existentes (se houver dados)
DELETE FROM financeiro;
DELETE FROM agendamentos;
DELETE FROM servicos;
DELETE FROM colaboradores;
DELETE FROM usuarios;
DELETE FROM clientes;

-- Resetar contadores de AUTOINCREMENT
DELETE FROM sqlite_sequence WHERE name IN ('usuarios', 'clientes', 'colaboradores', 'servicos', 'agendamentos', 'financeiro');

-- Inserir Clientes
INSERT INTO clientes (id, nome, email, telefone) VALUES 
(1, 'Carlos Silva', 'carlos.silva@email.com', '(11) 98888-1111'),
(2, 'Marcos Souza', 'marcos.souza@email.com', '(11) 98888-2222'),
(3, 'Lucas Pereira', 'lucas.pereira@email.com', '(11) 98888-3333'),
(4, 'Felipe Rodrigues', 'felipe.r@email.com', '(11) 97777-4444'),
(5, 'Rodrigo Alves', 'rodrigo.alves@email.com', '(11) 96666-5555'),
(6, 'Gabriel Costa', 'gabriel.costa@email.com', '(11) 95555-6666'),
(7, 'Thiago Santos', 'thiago.santos@email.com', '(11) 94444-7777');

-- Inserir Usuários (senha default: admin123 para admins, carlos123 para carlos)
INSERT INTO usuarios (nome, email, senha, role, cliente_id) VALUES 
('Admin Fio da Navalha', 'admin@fiodanavalha.com.br', '0cf6d83becc5ada7da39001a65741a86:c37fdb72250fcd4db68ef3927e3028c9102117b93fb1a60df9b36535f6db7db44fbb438636381464a18698adf6f412bea7625724a2ca57047f3d1a61909ebc9f', 'ADMIN', NULL),
('Atendente Fio da Navalha', 'atendente@fiodanavalha.com.br', '0cf6d83becc5ada7da39001a65741a86:c37fdb72250fcd4db68ef3927e3028c9102117b93fb1a60df9b36535f6db7db44fbb438636381464a18698adf6f412bea7625724a2ca57047f3d1a61909ebc9f', 'OPERADOR', NULL),
('Leticia Gomes', 'leticia123silvas@gmail.com', '949a006297aa749d7fc0005b825dc272:0a2c13a44d0de024a6eb79b06767870ef88298bd6eebf00157730463d4aa642a9ee3dd8b029e55f4225663175131a8ad947fdda24ab9f1e5eb626b64c964a182', 'ADMIN', NULL),
('Carlos Silva', 'carlos.silva@email.com', 'de81c9a61dd5ecd2cf74adf88beb6165:47e2fb2753caa7d44329e3048cf5c453a185267ed29af763f6e97caabe02a4df4d1668af51babff181fbafcd24942db77bd7eb3fa623318b030e3a8145554f13', 'CLIENTE', 1);

-- Inserir Colaboradores (Barbeiros)
INSERT INTO colaboradores (id, nome, especialidade, telefone) VALUES 
(1, 'Rodolfo "Navalha" Santos', 'Corte & Barba', '(11) 99999-0001'),
(2, 'Tiago "Degradê" Lima', 'Cortes Modernos', '(11) 99999-0002'),
(3, 'Bruno "Barba" Costa', 'Barboterapia & Visagismo', '(11) 99999-0003');

-- Inserir Serviços
INSERT INTO servicos (id, nome, preco, duracao, imagem) VALUES 
(1, 'Corte Masculino (Clássico)', 45.00, 30, '/images/corte_masculino.webp'),
(2, 'Corte Moderno (Degradê)', 55.00, 40, '/images/corte_degrade.webp'),
(3, 'Barba Clássica (Navalha & Toalha Quente)', 35.00, 30, '/images/barba.webp'),
(4, 'Barboterapia (Tratamento)', 50.00, 45, '/images/barboterapia.webp'),
(5, 'Cabelo + Barba (Combo)', 85.00, 60, '/images/combo.webp'),
(6, 'Pigmentação de Cabelo/Barba', 40.00, 30, '/images/pigmentacao.webp'),
(7, 'Selagem / Progressiva', 90.00, 90, '/images/selagem.webp');

-- Inserir Agendamentos (com datas variadas para simular receita e agendamentos futuros)
INSERT INTO agendamentos (id, cliente_id, colaborador_id, servico_id, data_hora, status) VALUES 
(1, 1, 1, 5, '2026-06-05 10:00:00', 'CONCLUIDO'),
(2, 2, 2, 2, '2026-06-05 14:00:00', 'CONCLUIDO'),
(3, 3, 3, 4, '2026-06-06 11:30:00', 'CONCLUIDO'),
(4, 4, 1, 1, '2026-06-06 16:00:00', 'CONCLUIDO'),
(5, 5, 2, 5, '2026-06-08 09:00:00', 'CONCLUIDO'),
(6, 6, 3, 3, '2026-06-09 15:00:00', 'CONCLUIDO'),
(7, 7, 1, 2, '2026-06-10 10:30:00', 'CONCLUIDO'),
-- Agendamentos adicionais concluidos para faturamento positivo
(13, 1, 2, 7, '2026-06-07 15:00:00', 'CONCLUIDO'),
(14, 2, 3, 5, '2026-06-10 18:00:00', 'CONCLUIDO'),
(15, 6, 1, 7, '2026-06-09 10:00:00', 'CONCLUIDO'),
-- Agendamentos Futuros ou Recentes pendentes
(8, 1, 2, 5, '2026-06-12 14:00:00', 'PENDENTE'),
(9, 3, 1, 1, '2026-06-12 10:00:00', 'PENDENTE'),
(10, 4, 3, 4, '2026-06-13 11:00:00', 'PENDENTE'),
(11, 2, 2, 2, '2026-06-14 16:30:00', 'PENDENTE'),
-- Cancelados
(12, 5, 1, 3, '2026-06-08 17:00:00', 'CANCELADO');

-- Inserir Financeiro (Receitas dos agendamentos concluídos e despesas de exemplo)
INSERT INTO financeiro (agendamento_id, tipo, valor, descricao, data) VALUES 
(1, 'RECEITA', 85.00, 'Serviço: Cabelo + Barba - Cliente: Carlos Silva', '2026-06-05'),
(2, 'RECEITA', 55.00, 'Serviço: Corte Moderno - Cliente: Marcos Souza', '2026-06-05'),
(3, 'RECEITA', 50.00, 'Serviço: Barboterapia - Cliente: Lucas Pereira', '2026-06-06'),
(4, 'RECEITA', 45.00, 'Serviço: Corte Masculino - Cliente: Felipe Rodrigues', '2026-06-06'),
(5, 'RECEITA', 85.00, 'Serviço: Cabelo + Barba - Cliente: Rodrigo Alves', '2026-06-08'),
(6, 'RECEITA', 35.00, 'Serviço: Barba Clássica - Cliente: Gabriel Costa', '2026-06-09'),
(7, 'RECEITA', 55.00, 'Serviço: Corte Moderno - Cliente: Thiago Santos', '2026-06-10'),
-- Receitas adicionais
(13, 'RECEITA', 90.00, 'Serviço: Selagem / Progressiva - Cliente: Carlos Silva', '2026-06-07'),
(14, 'RECEITA', 85.00, 'Serviço: Cabelo + Barba (Combo) - Cliente: Marcos Souza', '2026-06-10'),
(15, 'RECEITA', 90.00, 'Serviço: Selagem / Progressiva - Cliente: Gabriel Costa', '2026-06-09'),
-- Despesas avulsas
(NULL, 'DESPESA', 120.00, 'Compra de lâminas de barbear e loções', '2026-06-06'),
(NULL, 'DESPESA', 80.00, 'Produtos de higienização do salão', '2026-06-08'),
(NULL, 'DESPESA', 250.00, 'Conta de energia elétrica - Barbearia', '2026-06-09');
