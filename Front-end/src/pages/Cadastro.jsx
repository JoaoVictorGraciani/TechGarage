// src/pages/Cadastro.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const validar = () => {
    if (!form.nome.trim()) return 'Informe seu nome.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'E-mail inválido.';
    if (form.senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (form.senha !== form.confirmarSenha) return 'As senhas não coincidem.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      await cadastrar(form);
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
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Criar conta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Nome</label>
            <input
              value={form.nome}
              onChange={handleChange('nome')}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Telefone</label>
            <input
              value={form.telefone}
              onChange={handleChange('telefone')}
              placeholder="(41) 99999-9999"
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={handleChange('senha')}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1">Confirmar senha</label>
            <input
              type="password"
              value={form.confirmarSenha}
              onChange={handleChange('confirmarSenha')}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent)]"
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
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-sm text-[var(--color-text-secondary)] text-center mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline transition-colors duration-200">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;