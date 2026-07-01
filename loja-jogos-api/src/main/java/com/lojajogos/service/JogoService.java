package com.lojajogos.service;

import com.lojajogos.dto.JogoRequestDTO;
import com.lojajogos.dto.JogoResponseDTO;
import com.lojajogos.dto.externo.SteamBuscaResponseDTO;
import com.lojajogos.dto.externo.SteamJogoDTO;
import com.lojajogos.entity.Jogo;
import com.lojajogos.repository.JogoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class JogoService {

    private final JogoRepository jogoRepository;
    private final RestTemplate restTemplate;

    @Value("${steam.api.busca-url}")
    private String steamBuscaUrl;

    @Value("${steam.api.capa-url}")
    private String steamCapaUrl;

    @Transactional
    public JogoResponseDTO salvar(JogoRequestDTO dto) {
        Jogo jogo = converterParaEntity(dto);
        return converterParaResponseDTO(jogoRepository.save(jogo));
    }

    public List<JogoResponseDTO> listarTodos() {
        return jogoRepository.findAll().stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    public JogoResponseDTO buscarPorId(Long id) {
        return converterParaResponseDTO(buscarEntidadePorId(id));
    }

    @Transactional
    public JogoResponseDTO atualizar(Long id, JogoRequestDTO dto) {
        Jogo jogo = buscarEntidadePorId(id);
        jogo.setNome(dto.nome());
        jogo.setCategoria(dto.categoria());
        jogo.setPlataforma(dto.plataforma());
        jogo.setPreco(dto.preco());

        if (dto.imagemUrl() != null && !dto.imagemUrl().isBlank()) {
            jogo.setImagemUrl(dto.imagemUrl());
        } else if (jogo.getImagemUrl() == null || jogo.getImagemUrl().isBlank()) {
            jogo.setImagemUrl(buscarImagemNaApiExterna(dto.nome()));
        }

        return converterParaResponseDTO(jogoRepository.save(jogo));
    }

    @Transactional
    public void excluir(Long id) {
        Jogo jogo = buscarEntidadePorId(id);
        if (!jogo.getItensPedido().isEmpty()) {
            throw new IllegalArgumentException("Não é possível excluir jogo associado a pedidos");
        }
        jogoRepository.delete(jogo);
    }

    /**
     * Percorre os jogos que ainda não têm imagem cadastrada e tenta
     * preencher consumindo a Steam Store Search API pelo nome do jogo.
     * Falhas individuais (jogo não encontrado na Steam, erro de rede, etc.)
     * não interrompem o processamento dos demais jogos.
     */
    @Transactional
    public int atualizarImagensFaltantes() {
        List<Jogo> jogosSemImagem = jogoRepository.findAll().stream()
                .filter(jogo -> jogo.getImagemUrl() == null || jogo.getImagemUrl().isBlank())
                .toList();

        int atualizados = 0;
        for (Jogo jogo : jogosSemImagem) {
            String imagemUrl = buscarImagemNaApiExterna(jogo.getNome());
            if (imagemUrl != null && !imagemUrl.isBlank()) {
                jogo.setImagemUrl(imagemUrl);
                jogoRepository.save(jogo);
                atualizados++;
            }
        }

        log.info("Busca de imagens concluída: {}/{} jogos atualizados", atualizados, jogosSemImagem.size());
        return atualizados;
    }

    private Jogo buscarEntidadePorId(Long id) {
        return jogoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jogo não encontrado com id: " + id));
    }

    private Jogo converterParaEntity(JogoRequestDTO dto) {
        String imagemUrl = (dto.imagemUrl() != null && !dto.imagemUrl().isBlank())
                ? dto.imagemUrl()
                : buscarImagemNaApiExterna(dto.nome());

        return Jogo.builder()
                .nome(dto.nome())
                .categoria(dto.categoria())
                .plataforma(dto.plataforma())
                .preco(dto.preco())
                .imagemUrl(imagemUrl)
                .build();
    }

    /**
     * Busca a capa de um jogo na Steam Store Search API (pública, sem
     * necessidade de cadastro ou chave de API) a partir do nome. Retorna
     * null se não encontrar resultado ou se a chamada falhar, sem lançar
     * exceção — a ausência de imagem nunca deve impedir o cadastro/atualização
     * do jogo.
     */
    private String buscarImagemNaApiExterna(String nomeJogo) {
        if (nomeJogo == null || nomeJogo.isBlank()) {
            return null;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(steamBuscaUrl)
                    .queryParam("term", nomeJogo)
                    .queryParam("l", "english")
                    .queryParam("cc", "US")
                    .toUriString();

            SteamBuscaResponseDTO resposta = restTemplate.getForObject(url, SteamBuscaResponseDTO.class);

            if (resposta != null && resposta.items() != null && !resposta.items().isEmpty()) {
                SteamJogoDTO jogoEncontrado = resposta.items().get(0);
                if (jogoEncontrado.id() != null) {
                    return steamCapaUrl.replace("{appid}", String.valueOf(jogoEncontrado.id()));
                }
            }
        } catch (Exception e) {
            log.warn("Não foi possível buscar imagem para o jogo '{}': {}", nomeJogo, e.getMessage());
        }

        return null;
    }

    private JogoResponseDTO converterParaResponseDTO(Jogo entity) {
        return new JogoResponseDTO(
                entity.getId(),
                entity.getNome(),
                entity.getCategoria(),
                entity.getPlataforma(),
                entity.getPreco(),
                entity.getImagemUrl()
        );
    }
}
