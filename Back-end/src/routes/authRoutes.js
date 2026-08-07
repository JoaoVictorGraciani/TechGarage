const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

const router = express.Router();

// Cadastro de novo usuário
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nome é obrigatório." });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Já existe uma conta com esse e-mail." });
    }

    const senhaCriptografada = await bcrypt.hash(password, 10);

    const usuario = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        password: senhaCriptografada,
        phone: phone || null,
        role: 'CLIENT',
      },
    });

    // Nunca retornar a senha (nem o hash) na resposta
    const { password: _, ...usuarioSemSenha } = usuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const senhaCorreta = await bcrypt.compare(password, usuario.password);

    if (!senhaCorreta) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const { password: _, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login." });
  }
});

module.exports = router;