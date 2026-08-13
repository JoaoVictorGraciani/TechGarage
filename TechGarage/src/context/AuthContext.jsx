/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function restaurarSessao() {
      try {
        const { data } = await api.get('/auth/me');
        if (ativo) setUsuario(data.user);
      } catch (error) {
        if (ativo) setUsuario(null);
        if (error.response?.status !== 401) console.error('Erro ao restaurar sessão:', error);
      } finally {
        if (ativo) setCarregandoSessao(false);
      }
    }
    restaurarSessao();
    return () => { ativo = false; };
  }, []);

  const login = async (email, senha) => {
    try {
      const { data } = await api.post('/auth/login', { email, password: senha });
      setUsuario(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'E-mail ou senha inválidos.', { cause: error });
    }
  };

  const cadastrar = async ({ nome, email, senha, telefone }) => {
    try {
      const { data } = await api.post('/auth/register', { name: nome, email, password: senha, phone: telefone });
      setUsuario(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao cadastrar usuário.', { cause: error });
    }
  };

  const atualizarPerfil = async (payload) => {
    if (!usuario) throw new Error('Sessão não encontrada.');
    try {
      const { data } = await api.patch(`/users/${usuario.id}`, payload);
      setUsuario(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Não foi possível atualizar seu perfil.', { cause: error });
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); }
    catch (error) { console.error('Erro ao encerrar sessão:', error); }
    finally { setUsuario(null); }
  };

  return (
    <AuthContext.Provider value={{ usuario, carregandoSessao, autenticado: Boolean(usuario), login, cadastrar, atualizarPerfil, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
