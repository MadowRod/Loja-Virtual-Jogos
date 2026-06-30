import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import AnalisePedido from "../pages/AnalisePedido";
import Buscar from "../pages/Buscar";
import Cadastro from "../pages/Cadastro";
import Carrinho from "../pages/Carrinho";
import FinalizarPedido from "../pages/FinalizarPedido";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Pedidos from "../pages/Pedidos";
import Produtos from "../pages/Produtos";

function RotaPrivada({ children }) {
  const { carregandoToken, estaAutenticado } = useAuth();

  if (carregandoToken) {
    return <p className="loading">Carregando...</p>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route
            path="/carrinho"
            element={
              <RotaPrivada>
                <Carrinho />
              </RotaPrivada>
            }
          />
          <Route
            path="/finalizar-pedido"
            element={
              <RotaPrivada>
                <FinalizarPedido />
              </RotaPrivada>
            }
          />
          <Route
            path="/pedidos"
            element={
              <RotaPrivada>
                <Pedidos />
              </RotaPrivada>
            }
          />
          <Route
            path="/analise-pedido"
            element={
              <RotaPrivada>
                <AnalisePedido />
              </RotaPrivada>
            }
          />
          <Route path="*" element={<h1>404 - Pagina nao encontrada</h1>} />
        </Routes>
      </main>
    </>
  );
}
