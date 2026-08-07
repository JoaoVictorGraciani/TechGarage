// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    try {
      setCarregando(true);
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 py-16">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 animate-[fadeInUp_0.4s_ease]">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Entrar</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent)]"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent)]"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <p className="text-[var(--color-danger)] text-sm animate-[fadeInUp_0.2s_ease]">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold py-2.5 rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-[var(--color-text-secondary)] text-center mt-6">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-[var(--color-accent)] hover:underline transition-colors duration-200">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;