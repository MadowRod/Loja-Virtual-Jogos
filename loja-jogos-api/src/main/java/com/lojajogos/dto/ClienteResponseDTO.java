package com.lojajogos.dto;

public record ClienteResponseDTO(
        Long id,
        String nome,
        String email,
        String telefone
) {
}
