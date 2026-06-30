import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Carrinho() {
  const [itens, setItens] = useState(() =>
    JSON.parse(localStorage.getItem("lojaJogosCarrinho") || "[]")
  );

  const total = useMemo(
    () =>
      itens.reduce(
        (soma, item) => soma + Number(item.jogo.preco) * item.quantidade,
        0
      ),
    [itens]
  );

  function salvar(novosItens) {
    setItens(novosItens);
    localStorage.setItem("lojaJogosCarrinho", JSON.stringify(novosItens));
  }

  function alterarQuantidade(jogoId, quantidade) {
    const valor = Math.max(1, Number(quantidade));
    salvar(
      itens.map((item) =>
        item.jogo.id === jogoId ? { ...item, quantidade: valor } : item
      )
    );
  }

  function removerItem(jogoId) {
    salvar(itens.filter((item) => item.jogo.id !== jogoId));
  }

  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Compra</span>
        <h1>Carrinho</h1>
      </div>

      {itens.length === 0 ? (
        <p className="empty">Seu carrinho esta vazio.</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {itens.map((item) => (
              <article className="card cart-item" key={item.jogo.id}>
                <div>
                  <h2>{item.jogo.nome}</h2>
                  <p>
                    {item.jogo.plataforma} - {item.jogo.categoria}
                  </p>
                  <strong>{formatarMoeda(item.jogo.preco)}</strong>
                </div>
                <div className="quantity-control">
                  <label htmlFor={`quantidade-${item.jogo.id}`}>
                    Quantidade
                  </label>
                  <input
                    id={`quantidade-${item.jogo.id}`}
                    min="1"
                    type="number"
                    value={item.quantidade}
                    onChange={(event) =>
                      alterarQuantidade(item.jogo.id, event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => removerItem(item.jogo.id)}
                    aria-label={`Remover ${item.jogo.nome} do carrinho`}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="card summary">
            <span className="eyebrow">Resumo</span>
            <strong>{formatarMoeda(total)}</strong>
            <Link className="button" to="/finalizar-pedido">
              Finalizar pedido
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
