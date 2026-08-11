const prisma = require("../../prisma");

// Listar produtos
exports.getAll = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true
            }
        });

        res.json(products);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Buscar produto
exports.getById = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                category: true
            }
        });

        res.json(product);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Criar
exports.create = async (req, res) => {
    try {
        const product = await prisma.product.create({
            data: req.body
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Atualizar
exports.update = async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        });

        res.json(product);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Excluir
exports.remove = async (req, res) => {
    try {
        await prisma.product.delete({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json({
            message: "Produto removido."
        });
    } catch (error) {
        res.status(500).json(error);
    }
};