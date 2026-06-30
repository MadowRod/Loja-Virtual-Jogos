package com.lojajogos.dto;

public record ClienteResponseDTO(
        Long id,
        String nome,
        String email,
        String telefone,
        String cep,
        String rua,
        String numero,
        String bairro,
        String cidade,
        String pais
) {
}
