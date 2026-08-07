const prisma = require("../../prisma");

// ==============================
// Listar usuários
// ==============================
exports.getAll = async (req, res) => {
    try {
        const users = await prisma.user.findMany();

        res.json(users);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar usuários."
        });
    }
};


// ==============================
// Buscar usuário por ID
// ==============================
exports.getById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }

        res.json(user);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar usuário."
        });
    }
};


// ==============================
// Criar usuário
// ==============================
exports.create = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            role
        } = req.body;

        // Verificar se o email já existe
        const usuarioExistente = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                message: "Este email já está cadastrado."
            });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                phone,
                role: role || "CLIENT"
            }
        });

        res.status(201).json(user);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao criar usuário."
        });
    }
};


// ==============================
// Login
// ==============================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email e senha são obrigatórios."
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Senha incorreta."
            });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao fazer login."
        });
    }
};


// ==============================
// Atualizar usuário
// ==============================
exports.update = async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        });

        res.json(user);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao atualizar usuário."
        });
    }
};


// ==============================
// Excluir usuário
// ==============================
exports.remove = async (req, res) => {
    try {
        await prisma.user.delete({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json({
            message: "Usuário removido."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao excluir usuário."
        });
    }
};