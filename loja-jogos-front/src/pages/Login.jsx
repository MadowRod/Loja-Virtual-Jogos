import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formLogin, setFormLogin] = useState({ email: "", senha: "" });
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormLogin((formAtual) => ({ ...formAtual, [name]: value }));
  }

  async function enviarLogin(event) {
    event.preventDefault();
    setMensagem("");

    try {
      setCarregando(true);
      await login(formLogin);
      navigate("/produtos");
    } catch {
      setMensagem("Email ou senha invalidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="form-page">
      <form className="form-card" onSubmit={enviarLogin}>
        <span className="eyebrow">Acesso</span>
        <h1>Login</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          autoComplete="email"
          name="email"
          onChange={atualizarCampo}
          placeholder="seu@email.com"
          required
          type="email"
          value={formLogin.email}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          autoComplete="current-password"
          name="senha"
          onChange={atualizarCampo}
          placeholder="Digite sua senha"
          required
          type="password"
          value={formLogin.senha}
        />

        {mensagem && <p className="message error">{mensagem}</p>}

        <button disabled={carregando} type="submit" aria-label="Entrar na loja">
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <Link className="form-link" to="/cadastro">
          Criar cadastro
        </Link>
      </form>
    </section>
  );
}
