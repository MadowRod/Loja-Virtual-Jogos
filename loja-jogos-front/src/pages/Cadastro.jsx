import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Cadastro() {
  const navigate = useNavigate();
  const [formCadastro, setFormCadastro] = useState({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    pais: "Brasil",
  });
  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormCadastro((formAtual) => ({ ...formAtual, [name]: value }));

    if (name === "cep") {
      const cepLimpo = value.replace(/\D/g, "");

      if (cepLimpo.length === 8) {
        buscarCep(cepLimpo);
      }
    }
  }

  async function buscarCep(cep) {
    setBuscandoCep(true);

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        setErro("CEP nao encontrado.");
        return;
      }

      setErro("");
      setFormCadastro((formAtual) => ({
        ...formAtual,
        cep,
        rua: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
      }));
    } catch {
      setErro("Nao foi possivel buscar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function cadastrarCliente(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    if (formCadastro.senha !== formCadastro.confirmarSenha) {
      setErro("As senhas nao conferem.");
      return;
    }

    try {
      setCarregando(true);
      const dadosCadastro = {
        nome: formCadastro.nome,
        email: formCadastro.email,
        senha: formCadastro.senha,
        telefone: formCadastro.telefone,
        cep: formCadastro.cep,
        rua: formCadastro.rua,
        numero: formCadastro.numero,
        bairro: formCadastro.bairro,
        cidade: formCadastro.cidade,
        pais: formCadastro.pais,
      };
      await api.post("/clientes", dadosCadastro);
      setMensagem("Cadastro realizado com sucesso.");
      window.setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      if (!error.response) {
        setErro("Nao foi possivel conectar. Tente novamente em instantes.");
        return;
      }

      if (error.response.status === 400) {
        setErro("Confira os dados antes de cadastrar.");
        return;
      }

      if (error.response.status >= 500) {
        setErro("Nao foi possivel cadastrar. Verifique se o email ja existe.");
        return;
      }

      setErro("Nao foi possivel realizar o cadastro.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="form-page">
      <form className="form-card" onSubmit={cadastrarCliente}>
        <span className="eyebrow">Cliente</span>
        <h1>Cadastro</h1>

        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          autoComplete="name"
          minLength={2}
          name="nome"
          onChange={atualizarCampo}
          placeholder="Seu nome"
          required
          type="text"
          value={formCadastro.nome}
        />

        <label htmlFor="emailCadastro">Email</label>
        <input
          id="emailCadastro"
          autoComplete="email"
          name="email"
          onChange={atualizarCampo}
          placeholder="seu@email.com"
          required
          type="email"
          value={formCadastro.email}
        />

        <label htmlFor="cpfCadastro">CPF</label>
        <input
          id="cpfCadastro"
          autoComplete="off"
          name="cpf"
          onChange={atualizarCampo}
          placeholder="000.000.000-00"
          required
          type="text"
          value={formCadastro.cpf}
        />

        <label htmlFor="senhaCadastro">Senha</label>
        <input
          id="senhaCadastro"
          autoComplete="new-password"
          minLength={6}
          name="senha"
          onChange={atualizarCampo}
          placeholder="Minimo de 6 caracteres"
          required
          type="password"
          value={formCadastro.senha}
        />

        <label htmlFor="confirmarSenhaCadastro">Confirmar senha</label>
        <input
          id="confirmarSenhaCadastro"
          autoComplete="new-password"
          minLength={6}
          name="confirmarSenha"
          onChange={atualizarCampo}
          placeholder="Digite a senha novamente"
          required
          type="password"
          value={formCadastro.confirmarSenha}
        />

        <label htmlFor="telefoneCadastro">Telefone</label>
        <input
          id="telefoneCadastro"
          autoComplete="tel"
          name="telefone"
          onChange={atualizarCampo}
          placeholder="(00) 00000-0000"
          required
          type="tel"
          value={formCadastro.telefone}
        />

        <label htmlFor="cepCadastro">CEP</label>
        <input
          id="cepCadastro"
          autoComplete="postal-code"
          name="cep"
          onChange={atualizarCampo}
          placeholder="00000-000"
          required
          type="text"
          value={formCadastro.cep}
        />

        {buscandoCep && <p className="form-hint">Buscando CEP...</p>}

        <label htmlFor="ruaCadastro">Rua</label>
        <input
          id="ruaCadastro"
          autoComplete="address-line1"
          name="rua"
          onChange={atualizarCampo}
          placeholder="Rua"
          required
          type="text"
          value={formCadastro.rua}
        />

        <label htmlFor="numeroCadastro">Numero da casa</label>
        <input
          id="numeroCadastro"
          autoComplete="address-line2"
          name="numero"
          onChange={atualizarCampo}
          placeholder="123"
          required
          type="text"
          value={formCadastro.numero}
        />

        <label htmlFor="bairroCadastro">Bairro</label>
        <input
          id="bairroCadastro"
          autoComplete="address-level3"
          name="bairro"
          onChange={atualizarCampo}
          placeholder="Bairro"
          required
          type="text"
          value={formCadastro.bairro}
        />

        <label htmlFor="cidadeCadastro">Cidade</label>
        <input
          id="cidadeCadastro"
          autoComplete="address-level2"
          name="cidade"
          onChange={atualizarCampo}
          placeholder="Cidade"
          required
          type="text"
          value={formCadastro.cidade}
        />

        <label htmlFor="paisCadastro">Pais</label>
        <input
          id="paisCadastro"
          autoComplete="country-name"
          name="pais"
          onChange={atualizarCampo}
          placeholder="Brasil"
          required
          type="text"
          value={formCadastro.pais}
        />

        {mensagem && <p className="message success">{mensagem}</p>}
        {erro && <p className="message error">{erro}</p>}

        <button
          disabled={carregando}
          type="submit"
          aria-label="Cadastrar cliente"
        >
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>

        <Link className="form-link" to="/login">
          Ja tenho cadastro
        </Link>
      </form>
    </section>
  );
}
