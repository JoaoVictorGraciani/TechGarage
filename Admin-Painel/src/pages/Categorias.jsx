// src/pages/Categorias.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

const categoriasExemplo = [
    { id: 1, name: 'Notebooks' },
    { id: 2, name: 'Monitores' },
    { id: 3, name: 'Gamer' },
    { id: 4, name: 'Smartphones' },
  ];
  
  const produtosExemplo = [
    { id: 1, categoryId: 1 },
    { id: 2, categoryId: 1 },
    { id: 3, categoryId: 2 },
    { id: 4, categoryId: 3 },
  ];

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const [resCategorias, resProdutos] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        setCategorias(resCategorias.data);
        setProdutos(resProdutos.data);
      } catch (err) {
        setCategorias(categoriasExemplo);
        setProdutos(produtosExemplo);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const contarProdutos = (categoriaId) =>
    produtos.filter((p) => p.categoryId === categoriaId).length;

  const categoriasFiltradas = categorias.filter((c) =>
    c.name.toLowerCase().includes(busca.toLowerCase())
  );

  const exportarCSV = () => {
    const cabecalho = ['ID', 'Categoria', 'Qtd. Produtos'];
    const linhas = categoriasFiltradas.map((c) => [c.id, c.name, contarProdutos(c.id)]);
    const csv = [cabecalho, ...linhas].map((linha) => linha.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-categorias.csv';
    link.click();
  };

  if (loading) return <p className="text-[var(--color-text-secondary)]">Carregando...</p>;
  if (erro) return <p className="text-[var(--color-danger)]">{erro}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">TechGarage Store</h1>
      <p className="text-[var(--color-text-secondary)] mb-6">Relatório de Categorias</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card label="Categorias Cadastradas" valor={categorias.length} />
        <Card label="Produtos no Catálogo" valor={produtos.length} />
      </div>

      <div className="mb-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
        <input
          type="text"
          placeholder="Pesquisar categoria..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-hover)] text-left text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Qtd. Produtos</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.map((c) => (
              <tr key={c.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.id}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{contarProdutos(c.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {categoriasFiltradas.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)] py-8">Nenhuma categoria encontrada.</p>
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

export default Categorias;