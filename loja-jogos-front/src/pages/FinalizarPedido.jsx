import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function FinalizarPedido() {
  const navigate = useNavigate();
  const { cliente, logout } = useAuth();
  const [itens] = useState(() =>
    JSON.parse(localStorage.getItem("lojaJogosCarrinho") || "[]")
  );
  const [tipoEndereco, setTipoEndereco] = useState(
    cliente?.cep && cliente?.rua && cliente?.numero ? "cadastrado" : "novo"
  );
  const [enderecoSincronizado, setEnderecoSincronizado] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    pais: "Brasil",
  });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const total = useMemo(
    () =>
      itens.reduce(
        (soma, item) => soma + Number(item.jogo.preco) * item.quantidade,
        0
      ),
    [itens]
  );

  function atualizarEndereco(event) {
    const { name, value } = event.target;
    setNovoEndereco((enderecoAtual) => ({
      ...enderecoAtual,
      [name]: value,
    }));

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
      setNovoEndereco((enderecoAtual) => ({
        ...enderecoAtual,
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

  function obterEnderecoSelecionado() {
    if (tipoEndereco === "cadastrado") {
      return {
        cep: cliente.cep,
        rua: cliente.rua,
        numero: cliente.numero,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        pais: cliente.pais,
      };
    }

    if (tipoEndereco === "novo") {
      return novoEndereco;
    }

    return null;
  }

  const clienteTemEndereco =
    cliente?.cep && cliente?.rua && cliente?.numero;
  const nomeCliente =
    cliente?.nome && cliente.nome !== cliente.email
      ? cliente.nome
      : "Nome nao cadastrado";

  useEffect(() => {
    if (clienteTemEndereco && !enderecoSincronizado) {
      setTipoEndereco("cadastrado");
      setEnderecoSincronizado(true);
    }
  }, [clienteTemEndereco, enderecoSincronizado]);

  async function criarPedido() {
    setErro("");

    if (!cliente?.id) {
      setErro("Faca login novamente para finalizar o pedido.");
      return;
    }

    if (itens.length === 0) {
      setErro("Seu carrinho esta vazio.");
      return;
    }

    const itemSemId = itens.some((item) => !item.jogo?.id || !item.quantidade);

    if (itemSemId) {
      localStorage.removeItem("lojaJogosCarrinho");
      setErro("Seu carrinho tinha produto antigo. Adicione os produtos novamente.");
      return;
    }

    const enderecoSelecionado = obterEnderecoSelecionado();

    if (!enderecoSelecionado) {
      setErro("Escolha um endereco para entrega.");
      return;
    }

    const camposObrigatoriosEndereco = ["cep", "rua", "numero"];
    const enderecoIncompleto = camposObrigatoriosEndereco.some(
      (campo) => !String(enderecoSelecionado[campo] || "").trim()
    );

    if (enderecoIncompleto) {
      setErro("Preencha o endereco de entrega.");
      return;
    }

    try {
      setCarregando(true);
      const payload = {
        clienteId: cliente.id,
        itens: itens.map((item) => ({
          jogoId: item.jogo.id,
          quantidade: item.quantidade,
        })),
        statusPedido: "PENDENTE",
      };

      const { data: pedidoCriado } = await api.post("/pedidos", payload);
      const enderecosPedidos = JSON.parse(
        localStorage.getItem("lojaJogosEnderecosPedidos") || "{}"
      );
      localStorage.setItem(
        "lojaJogosEnderecosPedidos",
        JSON.stringify({
          ...enderecosPedidos,
          [pedidoCriado.id]: enderecoSelecionado,
        })
      );
      localStorage.removeItem("lojaJogosCarrinho");
      navigate("/pedidos");
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);

      if (error.response?.status === 404) {
        const mensagem = error.response?.data?.mensagem || "";

        if (mensagem.toLowerCase().includes("cliente")) {
          logout();
          setErro("Sua sessao expirou. Faca login novamente para finalizar o pedido.");
          return;
        }

        localStorage.removeItem("lojaJogosCarrinho");
        setErro("Seu carrinho tinha produto antigo. Adicione os produtos novamente.");
        return;
      }

      if (error.response?.status === 400) {
        setErro(
          error.response?.data?.mensagem ||
            "Confira os itens do carrinho antes de finalizar."
        );
        return;
      }

      if (error.response?.status === 403) {
        setErro("A API recusou a requisicao. Verifique se o front esta aberto em localhost:5173 e reinicie o backend.");
        return;
      }

      if (!error.response) {
        setErro("Nao foi possivel conectar ao backend. Verifique se a API esta rodando na porta 8080.");
        return;
      }

      if (error.response.status === 502) {
        setErro("Nao foi possivel conectar ao backend. Inicie a API na porta 8080 e tente novamente.");
        return;
      }

      setErro(
        error.response?.data?.mensagem ||
          `Nao foi possivel finalizar o pedido. Erro ${error.response.status}.`
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Checkout</span>
        <h1>Finalizar pedido</h1>
      </div>

      {itens.length === 0 ? (
        <p className="empty">
          Nao ha itens para finalizar. <Link to="/produtos">Ver produtos</Link>
        </p>
      ) : (
        <div className="card checkout-card">
          <h2>Cliente</h2>
          <p>Nome: {nomeCliente}</p>
          <p>Gmail: {cliente.email}</p>

          <h2>Endereco de entrega</h2>
          <div className="address-options" role="radiogroup" aria-label="Endereco de entrega">
            <label className="address-option" htmlFor="enderecoCadastrado">
              <input
                id="enderecoCadastrado"
                type="radio"
                name="tipoEndereco"
                value="cadastrado"
                checked={tipoEndereco === "cadastrado"}
                disabled={!clienteTemEndereco}
                onChange={(event) => {
                  setEnderecoSincronizado(true);
                  setTipoEndereco(event.target.value);
                }}
              />
              {clienteTemEndereco ? (
                <span>
                  Usar endereco cadastrado: Rua {cliente.rua}, numero{" "}
                  {cliente.numero}, CEP {cliente.cep}
                </span>
              ) : (
                <span>Usar endereco cadastrado: nenhum endereco salvo</span>
              )}
            </label>

            <label className="address-option" htmlFor="enderecoNovo">
              <input
                id="enderecoNovo"
                type="radio"
                name="tipoEndereco"
                value="novo"
                checked={tipoEndereco === "novo"}
                onChange={(event) => {
                  setEnderecoSincronizado(true);
                  setTipoEndereco(event.target.value);
                }}
              />
              <span>Cadastrar outro endereco</span>
            </label>
          </div>

          {tipoEndereco === "novo" && (
            <div className="address-form">
              <label htmlFor="cepEntrega">CEP</label>
              <input
                id="cepEntrega"
                autoComplete="postal-code"
                name="cep"
                onChange={atualizarEndereco}
                placeholder="00000-000"
                required
                type="text"
                value={novoEndereco.cep}
              />

              {buscandoCep && <p className="form-hint">Buscando CEP...</p>}

              <label htmlFor="ruaEntrega">Rua</label>
              <input
                id="ruaEntrega"
                autoComplete="address-line1"
                name="rua"
                onChange={atualizarEndereco}
                placeholder="Rua"
                required
                type="text"
                value={novoEndereco.rua}
              />

              <label htmlFor="numeroEntrega">Numero da casa</label>
              <input
                id="numeroEntrega"
                autoComplete="address-line2"
                name="numero"
                onChange={atualizarEndereco}
                placeholder="123"
                required
                type="text"
                value={novoEndereco.numero}
              />

              <label htmlFor="bairroEntrega">Bairro</label>
              <input
                id="bairroEntrega"
                autoComplete="address-level3"
                name="bairro"
                onChange={atualizarEndereco}
                placeholder="Bairro"
                required
                type="text"
                value={novoEndereco.bairro}
              />

              <label htmlFor="cidadeEntrega">Cidade</label>
              <input
                id="cidadeEntrega"
                autoComplete="address-level2"
                name="cidade"
                onChange={atualizarEndereco}
                placeholder="Cidade"
                required
                type="text"
                value={novoEndereco.cidade}
              />

              <label htmlFor="paisEntrega">Pais</label>
              <input
                id="paisEntrega"
                autoComplete="country-name"
                name="pais"
                onChange={atualizarEndereco}
                placeholder="Brasil"
                required
                type="text"
                value={novoEndereco.pais}
              />
            </div>
          )}

          <h2>Itens</h2>
          <ul className="item-list" aria-label="Itens para finalizar pedido">
            {itens.map((item) => (
              <li key={item.jogo.id}>
                <span>{item.jogo.nome}</span>
                <span>{item.quantidade} un.</span>
              </li>
            ))}
          </ul>

          <strong>Total: {formatarMoeda(total)}</strong>
          {erro && <p className="message error">{erro}</p>}
          <button
            type="button"
            disabled={carregando}
            onClick={criarPedido}
            aria-label="Confirmar e criar pedido"
          >
            {carregando ? "Finalizando..." : "Confirmar pedido"}
          </button>
        </div>
      )}
    </section>
  );
}
