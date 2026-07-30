// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const CHAVE_STORAGE = 'techgarage:usuario';

function carregarUsuarioInicial() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(carregarUsuarioInicial);

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(CHAVE_STORAGE);
    }
  }, [usuario]);

  const login = async (email, senha) => {
    const { data } = await api.get('/usuarios', { params: { email } });
    const encontrado = data.find((u) => u.email === email && u.senha === senha);
    if (!encontrado) {
      throw new Error('E-mail ou senha inválidos.');
    }
    const { senha: _, ...usuarioSemSenha } = encontrado;
    setUsuario(usuarioSemSenha);
    return usuarioSemSenha;
  };

  const cadastrar = async ({ nome, email, senha, telefone }) => {
    const { data: existentes } = await api.get('/usuarios', { params: { email } });
    if (existentes.length > 0) {
      throw new Error('Já existe uma conta com esse e-mail.');
    }
    const { data: novoUsuario } = await api.post('/usuarios', {
      nome,
      email,
      senha,
      telefone,
      perfil: 'cliente',
    });
    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    setUsuario(usuarioSemSenha);
    return usuarioSemSenha;
  };

  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}