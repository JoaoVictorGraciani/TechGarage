// src/pages/Produtos.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const LIMITE_BAIXO = 5;

function statusEstoque(stock) {
    if (stock === 0) return { label: 'Sem Estoque', cor: 'text-[var(--color-danger)] bg-[var(--color-danger)]/10' };
    if (stock <= LIMITE_BAIXO) return { label: 'Baixo', cor: 'text-[var(--color-warning)] bg-[var(--color-warning)]/10' };
    return { label: 'Normal', cor: 'text-[var(--color-success)] bg-[var(--color-success)]/10' };
}

const produtosExemplo = [
    { id: 1, name: 'Notebook Gamer Predator X15', price: 6499.90, stock: 5, categoryId: 1, category: { name: 'Notebooks' } },
    { id: 2, name: 'Monitor Gamer 27 165Hz', price: 1299.90, stock: 12, categoryId: 2, category: { name: 'Monitores' } },
    { id: 3, name: 'Placa de Vídeo RTX 4060 8GB', price: 2599.00, stock: 0, categoryId: 3, category: { name: 'Gamer' } },
    { id: 4, name: 'Fone Bluetooth TWS Pro', price: 279.90, stock: 2, categoryId: 5, category: { name: 'Headsets e Áudio' } },
    { id: 5, name: 'SSD NVMe 1TB', price: 449.90, stock: 18, categoryId: 7, category: { name: 'Armazenamento' } },
];

const categoriasExemplo = [
    { id: 1, name: 'Notebooks' },
    { id: 2, name: 'Monitores' },
    { id: 3, name: 'Gamer' },
    { id: 5, name: 'Headsets e Áudio' },
    { id: 7, name: 'Armazenamento' },
];

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    const [busca, setBusca] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
    const [statusFiltro, setStatusFiltro] = useState('todos');

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);
                const [resProdutos, resCategorias] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories'),
                ]);
                setProdutos(resProdutos.data);
                setCategorias(resCategorias.data);
            } catch (err) {
                setProdutos(produtosExemplo);
                setCategorias(categoriasExemplo);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, []);

    const produtosFiltrados = produtos.filter((p) => {
        const bateBusca = p.name.toLowerCase().includes(busca.toLowerCase());
        const bateCategoria = categoriaFiltro === 'todas' || p.categoryId === Number(categoriaFiltro);
        const status = statusEstoque(p.stock).label;
        const bateStatus = statusFiltro === 'todos' || status === statusFiltro;
        return bateBusca && bateCategoria && bateStatus;
    });

    const totalCadastrados = produtos.length;
    const totalEstoqueBaixo = produtos.filter((p) => p.stock > 0 && p.stock <= LIMITE_BAIXO).length;
    const totalSemEstoque = produtos.filter((p) => p.stock === 0).length;
    const valorTotalEstoque = produtos.reduce((soma, p) => soma + Number(p.price) * p.stock, 0);

    const exportarCSV = () => {
        const cabecalho = ['ID', 'Produto', 'Categoria', 'Estoque', 'Status', 'Preço'];
        const linhas = produtosFiltrados.map((p) => [
            p.id,
            p.name,
            p.category?.name || '-',
            p.stock,
            statusEstoque(p.stock).label,
            Number(p.price).toFixed(2),
        ]);
        const csv = [cabecalho, ...linhas].map((linha) => linha.join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio-estoque.csv';
        link.click();
    };

    if (loading) return <p className="text-[var(--color-text-secondary)]">Carregando...</p>;
    if (erro) return <p className="text-[var(--color-danger)]">{erro}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">TechGarage Store</h1>
            <p className="text-[var(--color-text-secondary)] mb-6">Relatório de Controle de Estoque</p>

            {/* Cards resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card label="Produtos Cadastrados" valor={totalCadastrados} />
                <Card label="Estoque Baixo" valor={totalEstoqueBaixo} destaque="warning" />
                <Card label="Sem Estoque" valor={totalSemEstoque} destaque="danger" />
                <Card
                    label="Valor Total em Estoque"
                    valor={valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
                <input
                    type="text"
                    placeholder="Pesquisar produto..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="flex-1 min-w-[200px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
                <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm"
                >
                    <option value="todas">Todas as categorias</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm"
                >
                    <option value="todos">Todos os status</option>
                    <option value="Normal">Normal</option>
                    <option value="Baixo">Baixo</option>
                    <option value="Sem Estoque">Sem Estoque</option>
                </select>
            </div>

            {/* Tabela */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[var(--color-surface-hover)] text-left text-[var(--color-text-secondary)]">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Produto</th>
                            <th className="px-4 py-3">Categoria</th>
                            <th className="px-4 py-3">Estoque</th>
                            <th className="px-4 py-3">Preço</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtosFiltrados.map((p) => {
                            const status = statusEstoque(p.stock);
                            return (
                                <tr key={p.id} className="border-t border-[var(--color-border)]">
                                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.id}</td>
                                    <td className="px-4 py-3">{p.name}</td>
                                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{p.category?.name || '-'}</td>
                                    <td className="px-4 py-3">{p.stock}</td>
                                    <td className="px-4 py-3">
                                        {Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.cor}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {produtosFiltrados.length === 0 && (
                    <p className="text-center text-[var(--color-text-muted)] py-8">Nenhum produto encontrado.</p>
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
            <div className="flex justify-end mb-4">
                <Link
                    to="/produtos/novo"
                    className="bg-[var(--color-accent)] text-[var(--color-accent-contrast)] text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-accent-hover)] transition-all active:scale-95"
                >
                    + Novo Produto
                </Link>
            </div>
        </div>

    );
}

function Card({ label, valor, destaque }) {
    const cor = destaque === 'danger' ? 'text-[var(--color-danger)]' : destaque === 'warning' ? 'text-[var(--color-warning)]' : 'text-[var(--color-accent)]';
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
            <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
        </div>
    );
}

export default Produtos;