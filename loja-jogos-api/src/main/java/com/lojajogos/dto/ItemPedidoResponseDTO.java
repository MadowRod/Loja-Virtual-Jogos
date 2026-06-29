package com.lojajogos.dto;

public record ItemPedidoResponseDTO(
        Long id,
        JogoResponseDTO jogo,
        Integer quantidade
) {
}
