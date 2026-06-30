package com.lojajogos.dto;

public record ClienteResponseDTO(
        Long id,
        String nome,
        String email,
        String cpf,
        String senha,
        String telefone,
        String cep,
        String rua,
        String numero,
        String bairro,
        String cidade,
        String pais
) {
}
