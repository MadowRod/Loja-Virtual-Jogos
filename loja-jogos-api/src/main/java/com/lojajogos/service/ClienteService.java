package com.lojajogos.service;

import com.lojajogos.dto.ClienteRequestDTO;
import com.lojajogos.dto.ClienteResponseDTO;
import com.lojajogos.dto.LoginRequestDTO;
import com.lojajogos.entity.Cliente;
import com.lojajogos.repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponseDTO salvar(ClienteRequestDTO dto) {
        Cliente cliente = converterParaEntity(dto);
        return converterParaResponseDTO(clienteRepository.save(cliente));
    }

    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    public ClienteResponseDTO buscarPorId(Long id) {
        return converterParaResponseDTO(buscarEntidadePorId(id));
    }

    public ClienteResponseDTO login(LoginRequestDTO dto) {
        Cliente cliente = clienteRepository.findByEmailIgnoreCase(dto.email())
                .filter(item -> item.getSenha().equals(dto.senha()))
                .orElseThrow(() -> new EntityNotFoundException("Email ou senha inválidos"));

        return converterParaResponseDTO(cliente);
    }

    @Transactional
    public ClienteResponseDTO atualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = buscarEntidadePorId(id);
        cliente.setNome(dto.nome());
        cliente.setEmail(dto.email());
        cliente.setSenha(dto.senha());
        cliente.setTelefone(dto.telefone());
        cliente.setCep(dto.cep());
        cliente.setRua(dto.rua());
        cliente.setNumero(dto.numero());
        cliente.setBairro(dto.bairro());
        cliente.setCidade(dto.cidade());
        cliente.setPais(dto.pais());
        return converterParaResponseDTO(clienteRepository.save(cliente));
    }

    @Transactional
    public void excluir(Long id) {
        Cliente cliente = buscarEntidadePorId(id);
        if (!cliente.getPedidos().isEmpty()) {
            throw new IllegalArgumentException("Não é possível excluir cliente com pedidos associados");
        }
        clienteRepository.delete(cliente);
    }

    private Cliente buscarEntidadePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com id: " + id));
    }

    private Cliente converterParaEntity(ClienteRequestDTO dto) {
        return Cliente.builder()
                .nome(dto.nome())
                .email(dto.email())
                .senha(dto.senha())
                .telefone(dto.telefone())
                .cep(dto.cep())
                .rua(dto.rua())
                .numero(dto.numero())
                .bairro(dto.bairro())
                .cidade(dto.cidade())
                .pais(dto.pais())
                .build();
    }

    private ClienteResponseDTO converterParaResponseDTO(Cliente entity) {
        return new ClienteResponseDTO(
                entity.getId(),
                entity.getNome(),
                entity.getEmail(),
                entity.getTelefone(),
                entity.getCep(),
                entity.getRua(),
                entity.getNumero(),
                entity.getBairro(),
                entity.getCidade(),
                entity.getPais()
        );
    }
}
