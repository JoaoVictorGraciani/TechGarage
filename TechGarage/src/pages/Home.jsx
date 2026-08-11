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

  if (erro) {
    return (
      <p className="text-center text-red-500 py-16">
        {erro}
      </p>
    );
  }

  let produtosFiltrados = produtos;

  let nomeCategoriaAtiva = '';

  if (categoriaSlug) {
    const categoriaEncontrada = categorias.find(
      (c) => slugify(c.name) === categoriaSlug
    );

    if (categoriaEncontrada) {
      nomeCategoriaAtiva = categoriaEncontrada.name;

      produtosFiltrados = produtosFiltrados.filter(
        (p) => String(p.categoryId) === String(categoriaEncontrada.id)
      );
    }
  }

  if (termoBusca) {
    produtosFiltrados = produtosFiltrados.filter((p) =>
      p.name.toLowerCase().includes(termoBusca)
    );
  }

  return (
    <main>
      {nomeCategoriaAtiva && (
        <h1 className="text-2xl font-bold mb-6">
          {nomeCategoriaAtiva}
        </h1>
      )}

      {produtosFiltrados.length === 0 ? (
        <p className="text-center text-zinc-400 py-16">
          {termoBusca
            ? `Ops, não encontramos este item`
            : 'Nenhum produto encontrado nesta categoria.'}
        </p>
      ) : (
        <ProductGrid
          produtos={produtosFiltrados}
          categorias={categorias}
        />
      )}
    </main>
  );
}

export default Home;