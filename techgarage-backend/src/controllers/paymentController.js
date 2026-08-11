const prisma = require("../../prisma");


// Listar todos os pagamentos
exports.getAll = async (req, res) => {
    try {

        const payments = await prisma.payment.findMany({
            include: {
                order: true
            }
        });

        res.json(payments);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar pagamentos."
        });

    }
};


// Buscar pagamento por ID

exports.getById = async (req, res) => {

    try {

        const payment = await prisma.payment.findUnique({

            where: {
                id: Number(req.params.id)
            },

            include: {
                order: true
            }

        });

        if (!payment) {

            return res.status(404).json({
                message: "Pagamento não encontrado."
            });

        }

        res.json(payment);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar pagamento."
        });

    }

};


// Criar pagamento

exports.create = async (req, res) => {

    try {

        const { orderId, type, pixCode, status } = req.body;

        // Verifica se o pedido existe
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

        const payment = await prisma.payment.create({

            data: {

                orderId: Number(orderId),

                type: type || "PIX",

                pixCode,

                status: status || "PENDING"

            }

        });

        res.status(201).json(payment);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao criar pagamento."
        });

    }

};


// Atualizar pagamento

exports.update = async (req, res) => {

    try {

        const { type, pixCode, status } = req.body;

        const payment = await prisma.payment.update({

            where: {
                id: Number(req.params.id)
            },

            data: {

                type,

                pixCode,

                status

            }

        });

        res.json(payment);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao atualizar pagamento."
        });

    }

};


// Excluir pagamento

exports.remove = async (req, res) => {

    try {

        await prisma.payment.delete({

            where: {
                id: Number(req.params.id)
            }

        });

        res.json({
            message: "Pagamento removido com sucesso."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erro ao remover pagamento."
        });

    }

};