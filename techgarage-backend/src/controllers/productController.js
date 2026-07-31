import prisma from "../config/prisma.js";

export const listar = async (req, res) => {
  try {
    const produtos = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    res.json(produtos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

export const criar = async (req, res) => {
  try {
    const produto = await prisma.product.create({
      data: req.body,
    });

    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};