package com.lojajogos.dto;

import com.lojajogos.entity.StatusPedido;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record PedidoRequestDTO(
        @NotNull @Positive Long clienteId,
        @NotEmpty List<@NotNull ItemPedidoRequestDTO> itens,
        StatusPedido statusPedido
) {
}
