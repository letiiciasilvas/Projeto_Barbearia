const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database/fiodanavalha.db');
const dbDir = path.dirname(dbPath);

// Garantir que a pasta database existe
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Conectar ao Banco de Dados SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite.');
        // Ativar chaves estrangeiras
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) console.error('Erro ao ativar PRAGMA foreign_keys:', err.message);
        });
    }
});

// Promisificar métodos do sqlite3 para usar async/await
const dbQuery = {
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    },

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    exec(sql) {
        return new Promise((resolve, reject) => {
            db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};

// Função de inicialização automática (cria tabelas e insere dados iniciais se vazio)
async function initializeDatabase() {
    try {
        // Verificar se a tabela 'usuarios' já existe
        const tableCheck = await dbQuery.get("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'");
        
        if (!tableCheck) {
            console.log('Banco de dados novo detectado. Inicializando tabelas e dados de exemplo...');
            
            // Ler e executar schema.sql
            const schemaPath = path.resolve(__dirname, '../database/schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await dbQuery.exec(schemaSql);
            console.log('Esquema do banco de dados criado com sucesso.');

            // Ler e executar seed.sql
            const seedPath = path.resolve(__dirname, '../database/seed.sql');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await dbQuery.exec(seedSql);
            console.log('Dados de exemplo inseridos com sucesso.');
        } else {
            console.log('Banco de dados já existente. Pulando inicialização de dados.');
        }
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
    }
}

module.exports = {
    db,
    dbQuery,
    initializeDatabase
};
