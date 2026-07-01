package com.lojajogos.dto.externo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Representa a resposta da busca pública da Steam Store
 * (https://store.steampowered.com/api/storesearch). Não exige cadastro
 * nem chave de API. Usada apenas para localizar o appid de um jogo a
 * partir do nome e montar a URL da imagem de capa oficial.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SteamBuscaResponseDTO(List<SteamJogoDTO> items) {
}
