package com.guildmanager.controller;

import com.guildmanager.dto.response.ItemResponse;
import com.guildmanager.exception.*;
import com.guildmanager.model.*;
import com.guildmanager.repository.*;
import com.guildmanager.security.UserDetailsImpl;
import com.guildmanager.service.AventureroMapperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {
    private final ItemRepository itemRepository;
    private final GremioRepository gremioRepository;
    private final AventureroMapperService mapper;

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getInventario(@AuthenticationPrincipal UserDetailsImpl user) {
        Gremio g = gremioRepository.findByUsuarioId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        return ResponseEntity.ok(itemRepository.findByGremioId(g.getId())
            .stream().map(mapper::itemToResponse).collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> vender(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user) {

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));
        Gremio g = gremioRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));

        if (!item.getGremio().getId().equals(g.getId()))
            throw new BusinessException("No tienes acceso a este ítem");
        if (item.isEquipado())
            throw new BusinessException("No puedes vender un ítem equipado");

        long oro = switch (item.getRareza()) {
            case COMUN            ->  50L;
            case RARO             -> 150L;
            case SUPER_RARO       -> 400L;
            case SUPER_ULTRA_RARO -> 1200L;
            case SECRETO          -> 5000L;
        };

        g.ganarOro(oro);
        gremioRepository.save(g);
        itemRepository.delete(item);

        return ResponseEntity.ok(Map.of(
                "mensaje", "Ítem vendido correctamente",
                "oroObtenido", oro,
                "oroTotal", g.getOro()
        ));
    }
}
