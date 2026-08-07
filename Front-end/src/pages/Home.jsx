import { useSearchParams } from 'react-router-dom';
import { useProdutos } from '../hooks/useProdutos';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import { slugify } from '../utils/slugify';

function Home() {
  const { produtos, categorias, loading, erro } = useProdutos();
  const [searchParams] = useSearchParams();
  const termoBusca = searchParams.get('busca')?.toLowerCase() || '';
  const categoriaSlug = searchParams.get('categoria') || '';

  if (loading) return <Loading />;
  if (erro) return <p className="text-center text-red-400 py-12">{erro}</p>;

  let produtosFiltrados = produtos;
  let nomeCategoriaAtiva = '';

  if (categoriaSlug) {
    const categoriaEncontrada = categorias.find((c) => slugify(c.name) === categoriaSlug);
    if (categoriaEncontrada) {
      nomeCategoriaAtiva = categoriaEncontrada.name;
      produtosFiltrados = produtosFiltrados.filter(
        (p) => p.categoryId === categoriaEncontrada.id
      );
    }
  }

  if (termoBusca) {
    produtosFiltrados = produtosFiltrados.filter((p) =>
      p.name.toLowerCase().includes(termoBusca)
    );
  }

  return (
    <main className="max-w-7xl mx-auto">
      <h2 className="text-lg font-semibold text-zinc-900 px-4 pt-4">
          {nomeCategoriaAtiva}
        </h2>

      {produtosFiltrados.length === 0 ? (
        <p className="text-center text-[var(--color-text-secondary)] py-16">
          {termoBusca
            ? `Nenhum produto encontrado para "${termoBusca}".`
            : 'Nenhum produto encontrado nesta categoria.'}
        </p>
      ) : (
        <ProductGrid produtos={produtosFiltrados} />
      )}
    </main>
  );
}

export default Home;