package com.lojajogos.service;

import com.lojajogos.dto.ClienteResponseDTO;
import com.lojajogos.dto.ItemPedidoRequestDTO;
import com.lojajogos.dto.ItemPedidoResponseDTO;
import com.lojajogos.dto.JogoResponseDTO;
import com.lojajogos.dto.PedidoRequestDTO;
import com.lojajogos.dto.PedidoResponseDTO;
import com.lojajogos.entity.Cliente;
import com.lojajogos.entity.ItemPedido;
import com.lojajogos.entity.Jogo;
import com.lojajogos.entity.Pedido;
import com.lojajogos.entity.StatusPedido;
import com.lojajogos.repository.ClienteRepository;
import com.lojajogos.repository.JogoRepository;
import com.lojajogos.repository.PedidoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final JogoRepository jogoRepository;

    @Transactional
    public PedidoResponseDTO salvar(PedidoRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com id: " + dto.clienteId()));

        Pedido pedido = converterParaEntity(dto, cliente);
        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        enviarPedidoParaAutomacao(pedidoSalvo);
        return converterParaResponseDTO(pedidoSalvo);
    }

    public List<PedidoResponseDTO> listarTodos() {
        return pedidoRepository.findAll().stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    public PedidoResponseDTO buscarPorId(Long id) {
        return converterParaResponseDTO(buscarEntidadePorId(id));
    }

    @Transactional
    public PedidoResponseDTO atualizarStatus(Long id, StatusPedido status) {
        if (status == null) {
            throw new IllegalArgumentException("Status do pedido não pode ser nulo");
        }

        Pedido pedido = buscarEntidadePorId(id);
        pedido.setStatusPedido(status);
        return converterParaResponseDTO(pedidoRepository.save(pedido));
    }

    @Transactional
    public void excluir(Long id) {
        Pedido pedido = buscarEntidadePorId(id);
        pedidoRepository.delete(pedido);
    }

    private Pedido buscarEntidadePorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com id: " + id));
    }

    private Pedido converterParaEntity(PedidoRequestDTO dto, Cliente cliente) {
        Pedido pedido = Pedido.builder()
                .cliente(cliente)
                .dataPedido(LocalDateTime.now())
                .statusPedido(dto.statusPedido() != null ? dto.statusPedido() : StatusPedido.PENDENTE)
                .build();

        List<ItemPedido> itens = converterItensParaEntity(dto.itens(), pedido);
        pedido.setItens(itens);
        pedido.setValorTotal(calcularValorTotal(itens));
        return pedido;
    }

    private List<ItemPedido> converterItensParaEntity(List<ItemPedidoRequestDTO> itensDto, Pedido pedido) {
        List<ItemPedido> itens = new ArrayList<>();

        for (ItemPedidoRequestDTO itemDto : itensDto) {
            Jogo jogo = jogoRepository.findById(itemDto.jogoId())
                    .orElseThrow(() -> new EntityNotFoundException("Jogo não encontrado com id: " + itemDto.jogoId()));

            itens.add(ItemPedido.builder()
                    .pedido(pedido)
                    .jogo(jogo)
                    .quantidade(itemDto.quantidade())
                    .build());
        }

        return itens;
    }

    private BigDecimal calcularValorTotal(List<ItemPedido> itens) {
        return itens.stream()
                .map(item -> item.getJogo().getPreco().multiply(BigDecimal.valueOf(item.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private PedidoResponseDTO converterParaResponseDTO(Pedido entity) {
        List<ItemPedidoResponseDTO> itens = entity.getItens().stream()
                .map(this::converterItemParaResponseDTO)
                .toList();

        return new PedidoResponseDTO(
                entity.getId(),
                converterClienteParaResponseDTO(entity.getCliente()),
                entity.getDataPedido(),
                entity.getValorTotal(),
                entity.getStatusPedido(),
                itens
        );
    }

    private ItemPedidoResponseDTO converterItemParaResponseDTO(ItemPedido item) {
        return new ItemPedidoResponseDTO(
                item.getId(),
                converterJogoParaResponseDTO(item.getJogo()),
                item.getQuantidade()
        );
    }

    private JogoResponseDTO converterJogoParaResponseDTO(Jogo jogo) {
        return new JogoResponseDTO(
                jogo.getId(),
                jogo.getNome(),
                jogo.getCategoria(),
                jogo.getPlataforma(),
                jogo.getPreco()
        );
    }

    private ClienteResponseDTO converterClienteParaResponseDTO(Cliente cliente) {
        return new ClienteResponseDTO(
                cliente.getId(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getTelefone()
        );
    }

    private void enviarPedidoParaAutomacao(Pedido pedido) {
        // Futuramente será feita uma requisição HTTP para o webhook do n8n.
    }
}
