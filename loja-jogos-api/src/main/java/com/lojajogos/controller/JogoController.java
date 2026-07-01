package com.lojajogos.controller;

import com.lojajogos.dto.JogoRequestDTO;
import com.lojajogos.dto.JogoResponseDTO;
import com.lojajogos.service.JogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jogos")
@RequiredArgsConstructor
public class JogoController {

    private final JogoService jogoService;

    @PostMapping
    public ResponseEntity<JogoResponseDTO> salvar(@Valid @RequestBody JogoRequestDTO dto) {
        JogoResponseDTO response = jogoService.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<JogoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(jogoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JogoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(jogoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JogoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody JogoRequestDTO dto
    ) {
        return ResponseEntity.ok(jogoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        jogoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/atualizar-imagens")
    public ResponseEntity<Map<String, Integer>> atualizarImagens() {
        int jogosAtualizados = jogoService.atualizarImagensFaltantes();
        return ResponseEntity.ok(Map.of("jogosAtualizados", jogosAtualizados));
    }
}
