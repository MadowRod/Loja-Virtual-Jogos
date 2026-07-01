package com.lojajogos.service;

import com.lojajogos.dto.AnaliseRequestDTO;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final JogoRepository jogoRepository;
    private final RestTemplate restTemplate;

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

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
    public PedidoResponseDTO atualizarAnalise(Long id, AnaliseRequestDTO dto) {
        Pedido pedido = buscarEntidadePorId(id);
        pedido.setPerfilCliente(dto.perfilCliente());
        pedido.setRecomendacoes(dto.recomendacoes());
        pedido.setCupomDesconto(dto.cupomDesconto());
        pedido.setMensagemIA(dto.mensagemIA());
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
                itens,
                entity.getPerfilCliente(),
                entity.getRecomendacoes(),
                entity.getCupomDesconto(),
                entity.getMensagemIA()
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
                jogo.getPreco(),
                jogo.getImagemUrl()
        );
    }

    private ClienteResponseDTO converterClienteParaResponseDTO(Cliente cliente) {
        return new ClienteResponseDTO(
                cliente.getId(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getTelefone(),
                cliente.getCep(),
                cliente.getRua(),
                cliente.getNumero(),
                cliente.getBairro(),
                cliente.getCidade(),
                cliente.getPais()
        );
    }

    private void enviarPedidoParaAutomacao(Pedido pedido) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", pedido.getId());
            payload.put("cliente", pedido.getCliente().getNome());
            payload.put("cidade", "Petrópolis");
            payload.put("valorTotal", pedido.getValorTotal());
            payload.put("produtos", pedido.getItens().stream()
                    .map(item -> item.getJogo().getNome())
                    .toList());

            restTemplate.postForEntity(n8nWebhookUrl, payload, Void.class);
        } catch (Exception e) {
            log.error("Erro ao enviar pedido {} para automação n8n: {}", pedido.getId(), e.getMessage(), e);
        }
    }
}
