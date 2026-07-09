import { useSearchParams } from 'react-router-dom';
import { useProdutos } from '../hooks/useProdutos';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';

function Home() {
  const { produtos, categorias, loading, erro } = useProdutos();
  const [searchParams] = useSearchParams();
  const termoBusca = searchParams.get('busca')?.toLowerCase() || '';

  if (loading) return <Loading />;
  if (erro) return <p className="text-center text-red-400 py-12">{erro}</p>;

  const produtosFiltrados = termoBusca
    ? produtos.filter((p) => p.nome.toLowerCase().includes(termoBusca))
    : produtos;

  return (
    <main className="max-w-7xl mx-auto">
      {termoBusca && produtosFiltrados.length === 0 ? (
        <p className="text-center text-zinc-400 py-16">
          Nenhum produto encontrado para "{termoBusca}".
        </p>
      ) : (
        <ProductGrid produtos={produtosFiltrados} categorias={categorias} />
      )}
    </main>
  );
}

export default Home;