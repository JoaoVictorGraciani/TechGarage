const prisma = require("../../prisma");

// Listar usuários
exports.getAll = async (req, res) => {
    try {
        const users = await prisma.user.findMany();

        res.json(users);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Buscar usuário
exports.getById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Criar usuário
exports.create = async (req, res) => {
    try {
        const user = await prisma.user.create({
            data: req.body
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Atualizar usuário
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
        res.status(500).json(error);
    }
};

// Excluir usuário
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
        res.status(500).json(error);
    }
};