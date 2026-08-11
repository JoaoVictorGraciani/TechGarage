const prisma = require("../../prisma");

// ==============================
// Listar todos os itens dos pedidos
// ==============================
exports.getAll = async (req, res) => {
    try {

        const items = await prisma.orderItem.findMany({
            include: {
                order: true,
                product: true
            }
        });

        res.json(items);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar itens do pedido."
        });

    }
};

// ==============================
// Buscar item por ID
// ==============================
exports.getById = async (req, res) => {

    try {

        const item = await prisma.orderItem.findUnique({

            where: {
                id: Number(req.params.id)
            },

            include: {
                order: true,
                product: true
            }

        });

        if (!item) {
            return res.status(404).json({
                message: "Item não encontrado."
            });
        }

        res.json(item);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar item."
        });

    }

};

// ==============================
// Criar item
// ==============================
exports.create = async (req, res) => {

    try {

        const { orderId, productId, quantity, unitPrice } = req.body;

        // Verifica pedido
        const order = await prisma.order.findUnique({
            where: {
                id: Number(orderId)
            }
        });

        if (!order) {
            return res.status(404).json({
                message: "Pedido não encontrado."
            });
        }

        // Verifica produto
        const product = await prisma.product.findUnique({
            where: {
                id: Number(productId)
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "Produto não encontrado."
            });
        }

        const item = await prisma.orderItem.create({

            data: {
                orderId: Number(orderId),
                productId: Number(productId),
                quantity: Number(quantity),
                unitPrice
            }

        });

        res.status(201).json(item);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao criar item."
        });

    }

};

// ==============================
// Atualizar item
// ==============================
exports.update = async (req, res) => {

    try {

        const { quantity, unitPrice } = req.body;

        const item = await prisma.orderItem.update({

            where: {
                id: Number(req.params.id)
            },

            data: {
                quantity: Number(quantity),
                unitPrice
            }

        });

        res.json(item);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao atualizar item."
        });

    }

};

// ==============================
// Excluir item
// ==============================
exports.remove = async (req, res) => {

    try {

        await prisma.orderItem.delete({

            where: {
                id: Number(req.params.id)
            }

        });

        res.json({
            message: "Item removido com sucesso."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao remover item."
        });

    }

};