/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cliente, setCliente] = useState(() => {
    const token = localStorage.getItem("lojaJogosToken");
    const clienteSalvo = localStorage.getItem("lojaJogosCliente");

    if (token && clienteSalvo) {
      return JSON.parse(clienteSalvo);
    }

    return null;
  }, []);
  const [carregandoToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("lojaJogosToken");

    if (!token || !cliente?.id) {
      return;
    }

    api
      .get(`/clientes/${cliente.id}`)
      .then(({ data }) => {
        localStorage.setItem("lojaJogosCliente", JSON.stringify(data));
        setCliente(data);
      })
      .catch(() => {
        localStorage.removeItem("lojaJogosToken");
        localStorage.removeItem("lojaJogosCliente");
        setCliente(null);
      });
  }, [cliente?.id]);

  async function login({ email, senha }) {
    const { data: clienteEncontrado } = await api.post("/clientes/login", {
      email,
      senha,
    });

    const token = `cliente-${clienteEncontrado.id}`;
    localStorage.setItem("lojaJogosToken", token);
    localStorage.setItem("lojaJogosCliente", JSON.stringify(clienteEncontrado));
    setCliente(clienteEncontrado);
    return clienteEncontrado;
  }

  function logout() {
    localStorage.removeItem("lojaJogosToken");
    localStorage.removeItem("lojaJogosCliente");
    setCliente(null);
  }

  const value = useMemo(
    () => ({
      carregandoToken,
      cliente,
      estaAutenticado: Boolean(cliente),
      login,
      logout,
    }),
    [carregandoToken, cliente]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
