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
    try {
      const { data } = await api.post('/auth/login', { email, password: senha });
      setUsuario(data);
      return data;
    } catch (err) {
      const mensagem = err.response?.data?.error || 'Erro ao fazer login.';
      throw new Error(mensagem);
    }
  };

  const cadastrar = async ({ nome, email, senha, telefone }) => {
    try {
      const { data } = await api.post('/auth/register', {
        name: nome,
        email,
        password: senha,
        phone: telefone,
      });
      setUsuario(data);
      return data;
    } catch (err) {
      const mensagem = err.response?.data?.error || 'Erro ao criar conta.';
      throw new Error(mensagem);
    }
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