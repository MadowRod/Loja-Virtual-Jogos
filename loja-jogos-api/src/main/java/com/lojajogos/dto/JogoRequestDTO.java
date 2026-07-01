package com.lojajogos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record JogoRequestDTO(
        @NotBlank String nome,
        @NotBlank String categoria,
        @NotBlank String plataforma,
        @NotNull @Positive BigDecimal preco,
        String imagemUrl
) {
}
