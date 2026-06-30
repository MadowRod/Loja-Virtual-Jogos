package com.lojajogos.service;

import com.lojajogos.dto.JogoRequestDTO;
import com.lojajogos.dto.JogoResponseDTO;
import com.lojajogos.entity.Jogo;
import com.lojajogos.repository.JogoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JogoService {

    private final JogoRepository jogoRepository;

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
        jogo.setImagemUrl(dto.imagemUrl());
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

    private Jogo buscarEntidadePorId(Long id) {
        return jogoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jogo não encontrado com id: " + id));
    }

    private Jogo converterParaEntity(JogoRequestDTO dto) {
        return Jogo.builder()
                .nome(dto.nome())
                .categoria(dto.categoria())
                .plataforma(dto.plataforma())
                .preco(dto.preco())
                .imagemUrl(dto.imagemUrl())
                .build();
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
