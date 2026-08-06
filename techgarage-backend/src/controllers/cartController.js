const prisma = require("../../prisma");

// Listar carrinho do usuário
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await prisma.cart.findMany({
            where: {
                userId: Number(userId)
            },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        });

        res.json(cart);

    } catch (error) {
    console.log(error);

    res.status(500).json({
        error: error.message
    });}
};

// Adicionar produto ao carrinho
// Adicionar produto ao carrinho
exports.addItem = async (req, res) => {
    try {

        const { userId, productId, quantity } = req.body;

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

        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Estoque insuficiente."
            });
        }

        const existingItem = await prisma.cart.findFirst({
            where: {
                userId: Number(userId),
                productId: Number(productId)
            }
        });

        let cartItem;

        if (existingItem) {

            cartItem = await prisma.cart.update({
                where: {
                    id: existingItem.id
                },
                data: {
                    quantity: existingItem.quantity + Number(quantity)
                }
            });

        } else {

            cartItem = await prisma.cart.create({
                data: {
                    userId: Number(userId),
                    productId: Number(productId),
                    quantity: Number(quantity)
                }
            });

        }

        await prisma.product.update({
            where: {
                id: Number(productId)
            },
            data: {
                stock: {
                    decrement: Number(quantity)
                }
            }
        });

        return res.status(201).json(cartItem);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });

    }
};

// Atualizar quantidade
exports.updateItem = async (req, res) => {

    try {

        const { id } = req.params;
        const { quantity } = req.body;

        const item = await prisma.cart.update({
            where: {
                id: Number(id)
            },
            data: {
                quantity: Number(quantity)
            }
        });

        res.json(item);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao atualizar carrinho."
        });

    }

};

// Remover item
exports.deleteItem = async (req, res) => {

    try {

        await prisma.cart.delete({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json({
            message: "Item removido do carrinho."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao remover item."
        });

    }

};