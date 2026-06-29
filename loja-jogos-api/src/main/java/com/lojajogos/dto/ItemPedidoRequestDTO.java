package com.lojajogos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ItemPedidoRequestDTO(
        @NotNull @Positive Long jogoId,
        @NotNull @Positive Integer quantidade
) {
}
