const prisma = require("../../prisma");

// Listar categorias
exports.getAll = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();

        res.json(categories);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Buscar por ID
exports.getById = async (req, res) => {
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json(category);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Criar categoria
exports.create = async (req, res) => {
    try {
        const category = await prisma.category.create({
            data: req.body
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Atualizar
exports.update = async (req, res) => {
    try {
        const category = await prisma.category.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        });

        res.json(category);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Excluir
exports.remove = async (req, res) => {
    try {
        await prisma.category.delete({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json({
            message: "Categoria removida."
        });
    } catch (error) {
        res.status(500).json(error);
    }
};