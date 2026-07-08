import { useEffect, useState } from "react";
import ProductGrid from "../components/ProductGrid";
import api from "../services/api";

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarProdutos();
  }, []);

    async function carregarProdutos() {
        try {
            const response = await api.get("/produtos");

            console.log(response.data);

            setProdutos(response.data);

        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        } finally {
            setLoading(false);
        }
    }

  if (loading) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold">Carregando produtos...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Produtos</h1>

      <ProductGrid produtos={produtos} />
    </div>
  );
}

export default Home;