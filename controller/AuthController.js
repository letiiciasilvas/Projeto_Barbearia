const AuthService = require('../service/AuthService');
const UserDTO = require('../dto/UserDTO');

const authService = new AuthService();

class AuthController {
    async login(req, res) {
        try {
            const validation = UserDTO.validateLogin(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, errors: validation.errors });
            }

            const { email, senha } = validation.data;
            const result = await authService.login(email, senha);

            return res.status(200).json({
                success: true,
                message: 'Login realizado com sucesso.',
                token: result.token,
                user: result.user
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Erro durante a autenticação.'
            });
        }
    }

    // Middleware de verificação de token (usado para rotas protegidas)
    static verificarTokenMiddleware(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Acesso negado. Token de autenticação não fornecido.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = AuthService.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Acesso negado. Token expirado ou inválido.'
            });
        }

        req.user = decoded; // Adiciona os dados do usuário logado na requisição
        next();
    }
}

module.exports = AuthController;
