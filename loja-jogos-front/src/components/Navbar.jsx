import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { cliente, estaAutenticado, logout } = useAuth();

  return (
    <header className="navbar">
      <Link className="brand" to="/" aria-label="Ir para a home da loja">
        Loja Virtual de Jogos
      </Link>

      <nav className="nav-links" aria-label="Navegacao principal">
        <NavLink to="/produtos">Produtos</NavLink>
        <NavLink to="/buscar">Buscar</NavLink>
        {estaAutenticado && <NavLink to="/carrinho">Carrinho</NavLink>}
        {estaAutenticado && <NavLink to="/pedidos">Pedidos</NavLink>}
        {estaAutenticado && <NavLink to="/analise-pedido">Analise</NavLink>}
      </nav>

      <div className="nav-actions">
        {estaAutenticado ? (
          <>
            <span className="user-name">{cliente?.nome}</span>
            <button type="button" onClick={logout} aria-label="Sair da conta">
              Sair
            </button>
          </>
        ) : (
          <>
            <NavLink className="button ghost" to="/login">
              Login
            </NavLink>
            <NavLink className="button" to="/cadastro">
              Cadastro
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
