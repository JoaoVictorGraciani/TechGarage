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

  // LOGIN
  const login = async (email, senha) => {
    try {
      const { data } = await api.post('/users/login', {
        email,
        password: senha,
      });

      setUsuario(data);

      return data;

    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        'E-mail ou senha inválidos.'
      );
    }
  };

  // CADASTRO
  const cadastrar = async ({
    nome,
    email,
    senha,
    telefone
  }) => {
    try {
      const { data } = await api.post('/users', {
        name: nome,
        email,
        password: senha,
        phone: telefone,
        role: 'CLIENT',
      });

      const usuarioSemSenha = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      };

      setUsuario(usuarioSemSenha);

      return usuarioSemSenha;

    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        'Erro ao cadastrar usuário.'
      );
    }
  };

  // LOGOUT
  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        cadastrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}