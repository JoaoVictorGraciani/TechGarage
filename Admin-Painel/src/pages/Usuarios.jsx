// src/pages/Usuarios.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

const usuariosExemplo = [
  { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-0000', role: 'CLIENT', createdAt: '2026-03-12T10:00:00Z' },
  { id: 2, name: 'Ana Oliveira', email: 'ana@email.com', phone: '(19) 99888-1111', role: 'CLIENT', createdAt: '2026-04-02T14:30:00Z' },
  { id: 3, name: 'Lucas Martins', email: 'lucas@email.com', phone: '(41) 99777-2222', role: 'ADMIN', createdAt: '2026-01-20T09:15:00Z' },
  { id: 4, name: 'Carlos Souza', email: 'carlos@email.com', phone: '(31) 99666-3333', role: 'CLIENT', createdAt: '2026-05-18T16:45:00Z' },
];

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('todos');

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const res = await api.get('/users');
        setUsuarios(res.data);
      } catch (err) {
        // Rota /api/users ainda não existe no back-end — usa dados de exemplo para visualização
        setUsuarios(usuariosExemplo);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const bateBusca =
      u.name.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase());
    const batePerfil = perfilFiltro === 'todos' || u.role === perfilFiltro;
    return bateBusca && batePerfil;
  });

  const totalClientes = usuarios.filter((u) => u.role === 'CLIENT').length;
  const totalAdmins = usuarios.filter((u) => u.role === 'ADMIN').length;

  const exportarCSV = () => {
    const cabecalho = ['ID', 'Nome', 'Email', 'Telefone', 'Perfil', 'Data de Cadastro'];
    const linhas = usuariosFiltrados.map((u) => [
      u.id,
      u.name,
      u.email,
      u.phone || '-',
      u.role,
      formatarData(u.createdAt),
    ]);
    const csv = [cabecalho, ...linhas].map((linha) => linha.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-clientes.csv';
    link.click();
  };

  if (loading) return <p className="text-[var(--color-text-secondary)]">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">TechGarage Store</h1>
      <p className="text-[var(--color-text-secondary)] mb-6">Relatório de Clientes Cadastrados</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card label="Total de Usuários" valor={usuarios.length} />
        <Card label="Clientes" valor={totalClientes} />
        <Card label="Administradores" valor={totalAdmins} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 min-w-[200px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
        <select
          value={perfilFiltro}
          onChange={(e) => setPerfilFiltro(e.target.value)}
          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm"
        >
          <option value="todos">Todos os perfis</option>
          <option value="CLIENT">Clientes</option>
          <option value="ADMIN">Administradores</option>
        </select>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-hover)] text-left text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{u.id}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{u.email}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{u.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'ADMIN'
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                        : 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    {u.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatarData(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuariosFiltrados.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)] py-8">Nenhum usuário encontrado.</p>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={exportarCSV}
          className="bg-[var(--color-accent)] text-[var(--color-accent-contrast)] text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Exportar CSV
        </button>
        <button
          onClick={() => window.print()}
          className="bg-[var(--color-surface-hover)] border border-[var(--color-border-hover)] text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] hover:border-[var(--color-accent)] transition-colors"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
}

function Card({ label, valor }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--color-accent)]">{valor}</p>
    </div>
  );
}

export default Usuarios;