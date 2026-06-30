package com.lojajogos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClienteRequestDTO(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotBlank String cpf,
        @NotBlank String senha,
        @NotBlank String telefone,
        @NotBlank String cep,
        @NotBlank String rua,
        @NotBlank String numero,
        @NotBlank String bairro,
        @NotBlank String cidade,
        @NotBlank String pais
) {
}
