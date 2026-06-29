package com.lojajogos.dto;

import java.math.BigDecimal;

public record JogoResponseDTO(
        Long id,
        String nome,
        String categoria,
        String plataforma,
        BigDecimal preco
) {
}
