const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repository/UserRepository');

const JWT_SECRET = 'fiodanavalha_secret_key_9988'; // Em produção usar var de ambiente
const userRepo = new UserRepository();

class AuthService {
    // Criptografa uma senha usando PBKDF2 nativo
    static hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }

    // Verifica a senha informada contra o hash armazenado
    static verifyPassword(password, storedPassword) {
        if (!storedPassword || !storedPassword.includes(':')) return false;
        const [salt, originalHash] = storedPassword.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return hash === originalHash;
    }

    // Realiza o login do usuário e retorna o token JWT
    async login(email, password) {
        const user = await userRepo.findByEmail(email);
        if (!user) {
            throw new Error('E-mail ou senha inválidos.');
        }

        const isPasswordCorrect = AuthService.verifyPassword(password, user.senha);
        if (!isPasswordCorrect) {
            throw new Error('E-mail ou senha inválidos.');
        }

        // Gerar token JWT (expira em 8 horas)
        const token = jwt.sign(
            { id: user.id, nome: user.nome, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return {
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        };
    }

    // Valida um token JWT recebido
    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}

module.exports = AuthService;
