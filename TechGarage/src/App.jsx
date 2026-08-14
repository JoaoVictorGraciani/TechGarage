import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Produto from './pages/Produto';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';
import PedidosCliente from './pages/PedidosCliente';
import PedidoDetalhe from './pages/PedidoDetalhe';
import NotFound from './pages/NotFound';
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Produtos from './admin/pages/Produtos';
import CadastroProduto from './admin/pages/CadastroProduto';
import Categorias from './admin/pages/Categorias';
import Pedidos from './admin/pages/Pedidos';
import Usuarios from './admin/pages/Usuarios';
import Estoque from './admin/pages/Estoque';

function App() {
  const location = useLocation();
  const admin = location.pathname.startsWith('/admin');
  return <>{!admin && <Header />}<Routes>
    <Route path="/" element={<Home />} />
    <Route path="/produto/:id" element={<Produto />} />
    <Route path="/carrinho" element={<ProtectedRoute><Carrinho /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
    <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
    <Route path="/pedidos" element={<ProtectedRoute><PedidosCliente /></ProtectedRoute>} />
    <Route path="/pedidos/:id" element={<ProtectedRoute><PedidoDetalhe /></ProtectedRoute>} />
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="produtos" element={<Produtos />} />
      <Route path="produtos/novo" element={<CadastroProduto />} />
      <Route path="produtos/editar/:id" element={<CadastroProduto />} />
      <Route path="categorias" element={<Categorias />} />
      <Route path="estoque" element={<Estoque />} />
      <Route path="pedidos" element={<Pedidos />} />
      <Route path="usuarios" element={<Usuarios />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes></>;
}
export default App;
