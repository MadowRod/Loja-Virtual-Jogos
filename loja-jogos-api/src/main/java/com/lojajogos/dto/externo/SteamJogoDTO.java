package com.lojajogos.dto.externo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SteamJogoDTO(
        Long id,
        String name
) {
}
