const prisma = require("../../prisma");

// Listar todos os pedidos
exports.getAll = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                },
                payments: true
            }
        });

        res.json(orders);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar pedidos."
        });
    }
};


// Buscar pedido por ID
exports.getById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                },
                payments: true
            }
        });

        if (!order) {
            return res.status(404).json({
                message: "Pedido não encontrado."
            });
        }

        res.json(order);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar pedido."
        });
    }
};


// Criar pedido
exports.create = async (req, res) => {
    try {
        const { userId, items } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "O pedido precisa ter pelo menos um produto."
            });
        }

        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: {
                    id: Number(item.productId)
                }
            });

            if (!product) {
                return res.status(404).json({
                    message: `Produto ${item.productId} não encontrado.`
                });
            }

            total += Number(product.price) * Number(item.quantity);

            orderItems.push({
                productId: product.id,
                quantity: Number(item.quantity),
                unitPrice: product.price
            });
        }

        const order = await prisma.order.create({
            data: {
                userId: Number(userId),
                totalValue: total,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: true
            }
        });

        // Limpa o carrinho no banco
        await prisma.cart.deleteMany({
            where: {
                userId: Number(userId)
            }
        });

        res.status(201).json(order);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};


// Atualizar status
exports.update = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await prisma.order.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                status
            }
        });

        res.json(order);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao atualizar pedido."
        });
    }
};


// Excluir pedido
exports.remove = async (req, res) => {
    try {
        await prisma.order.delete({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json({
            message: "Pedido removido."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao excluir pedido."
        });
    }
};