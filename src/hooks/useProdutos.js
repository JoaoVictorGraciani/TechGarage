import { useEffect, useState } from 'react';
import api from '../services/api';

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const [resProdutos, resCategorias] = await Promise.all([
          api.get('/produtos'),
          api.get('/categorias'),
        ]);
        setProdutos(resProdutos.data);
        setCategorias(resCategorias.data);
      } catch (err) {
        setErro('Não foi possível carregar os produtos.');
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  return { produtos, categorias, loading, erro };
}