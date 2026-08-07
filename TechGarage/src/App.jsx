import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/carrinho"
          element={
            <ProtectedRoute>
              <Carrinho />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </>
  );
}

export default App;