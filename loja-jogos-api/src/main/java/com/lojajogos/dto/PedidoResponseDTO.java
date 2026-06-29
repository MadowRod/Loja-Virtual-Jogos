package com.lojajogos.dto;

import com.lojajogos.entity.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponseDTO(
        Long id,
        ClienteResponseDTO cliente,
        LocalDateTime dataPedido,
        BigDecimal valorTotal,
        StatusPedido statusPedido,
        List<ItemPedidoResponseDTO> itens
) {
}
