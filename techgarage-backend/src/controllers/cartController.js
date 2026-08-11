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
        });
    }
};


// Adicionar produto ao carrinho
exports.addItem = async (req, res) => {
    try {

        const { userId, productId, quantity } = req.body;

        const quantidade = Number(quantity);

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

        if (product.stock < quantidade) {
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
                    quantity: existingItem.quantity + quantidade
                }
            });

        } else {

            cartItem = await prisma.cart.create({
                data: {
                    userId: Number(userId),
                    productId: Number(productId),
                    quantity: quantidade
                }
            });

        }

        // Diminui o estoque
        await prisma.product.update({
            where: {
                id: Number(productId)
            },
            data: {
                stock: {
                    decrement: quantidade
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

        const novaQuantidade = Number(quantity);

        // Buscar item atual do carrinho
        const itemAtual = await prisma.cart.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!itemAtual) {
            return res.status(404).json({
                message: "Item não encontrado no carrinho."
            });
        }

        const diferenca = novaQuantidade - itemAtual.quantity;

        // Aumentando quantidade
        if (diferenca > 0) {

            const product = await prisma.product.findUnique({
                where: {
                    id: itemAtual.productId
                }
            });

            if (!product) {
                return res.status(404).json({
                    message: "Produto não encontrado."
                });
            }

            if (product.stock < diferenca) {
                return res.status(400).json({
                    message: "Estoque insuficiente."
                });
            }

            // Retira do estoque somente a diferença
            await prisma.product.update({
                where: {
                    id: itemAtual.productId
                },
                data: {
                    stock: {
                        decrement: diferenca
                    }
                }
            });
        }

        // Diminuindo quantidade
        if (diferenca < 0) {

            // Devolve ao estoque somente a diferença
            await prisma.product.update({
                where: {
                    id: itemAtual.productId
                },
                data: {
                    stock: {
                        increment: Math.abs(diferenca)
                    }
                }
            });
        }

        const item = await prisma.cart.update({
            where: {
                id: Number(id)
            },
            data: {
                quantity: novaQuantidade
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

        const item = await prisma.cart.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        if (!item) {
            return res.status(404).json({
                message: "Item não encontrado no carrinho."
            });
        }

        // Devolve toda a quantidade para o estoque
        await prisma.product.update({
            where: {
                id: item.productId
            },
            data: {
                stock: {
                    increment: item.quantity
                }
            }
        });

        // Apaga item do carrinho
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