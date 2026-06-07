package com.guildmanager.controller;

import com.guildmanager.dto.response.*;
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
import java.util.stream.Collectors;import org.springframework.transaction.annotation.Transactional;


@RestController
@RequestMapping("/api/aventureros")
@RequiredArgsConstructor
public class AventureroController {
    private final AventureroRepository aventureroRepository;
    private final GremioRepository gremioRepository;
    private final ItemRepository itemRepository;
    private final AventureroMapperService mapper;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AventureroResponse>> getAll(@AuthenticationPrincipal UserDetailsImpl user) {
        Gremio g = gremioRepository.findByUsuarioId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        return ResponseEntity.ok(aventureroRepository.findByGremioId(g.getId())
            .stream().map(mapper::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AventureroResponse> getById(
            @PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        Aventurero av = aventureroRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Aventurero no encontrado"));
        Gremio g = gremioRepository.findByUsuarioId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        if (!av.getGremio().getId().equals(g.getId()))
            throw new BusinessException("No tienes acceso a este aventurero");
        return ResponseEntity.ok(mapper.toResponse(av));
    }

    @PutMapping("/{id}/equipo")
    public ResponseEntity<AventureroResponse> equiparItem(
            @PathVariable Long id,
            @RequestParam(required = false) Long armaId,
            @RequestParam(required = false) Long armaduraId,
            @AuthenticationPrincipal UserDetailsImpl user) {
        Aventurero av = aventureroRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Aventurero no encontrado"));
        Gremio g = gremioRepository.findByUsuarioId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        if (!av.getGremio().getId().equals(g.getId()))
            throw new BusinessException("No tienes acceso a este aventurero");

        if (armaId != null) {
            if (av.getArma() != null) { av.getArma().setEquipado(false); itemRepository.save(av.getArma()); }
            if (armaId == -1L) { av.setArma(null); }
            else {
                Item arma = itemRepository.findById(armaId).orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));
                if (arma.getTipo() != TipoItem.ARMA) throw new BusinessException("El ítem no es un arma");
                if (av.getNivel() < arma.getNivelRequerido()) throw new BusinessException("Nivel insuficiente para equipar este ítem");
                arma.setEquipado(true); itemRepository.save(arma); av.setArma(arma);
            }
        }
        if (armaduraId != null) {
            if (av.getArmadura() != null) { av.getArmadura().setEquipado(false); itemRepository.save(av.getArmadura()); }
            if (armaduraId == -1L) { av.setArmadura(null); }
            else {
                Item armadura = itemRepository.findById(armaduraId).orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));
                if (armadura.getTipo() != TipoItem.ARMADURA) throw new BusinessException("El ítem no es una armadura");
                if (av.getNivel() < armadura.getNivelRequerido()) throw new BusinessException("Nivel insuficiente para equipar este ítem");
                armadura.setEquipado(true); itemRepository.save(armadura); av.setArmadura(armadura);
            }
        }
        return ResponseEntity.ok(mapper.toResponse(aventureroRepository.save(av)));
    }
}
