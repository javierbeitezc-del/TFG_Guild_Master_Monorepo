package com.guildmanager.controller;

import com.guildmanager.dto.response.GremioResponse;
import com.guildmanager.exception.ResourceNotFoundException;
import com.guildmanager.model.EstadoAventura;
import com.guildmanager.model.Gremio;
import com.guildmanager.repository.AventuraRepository;
import com.guildmanager.repository.AventureroRepository;
import com.guildmanager.repository.GremioRepository;
import com.guildmanager.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gremio")
@RequiredArgsConstructor
public class GremioController {

    private final GremioRepository gremioRepository;
    private final AventureroRepository aventureroRepository;
    private final AventuraRepository aventuraRepository;

    @GetMapping
    public ResponseEntity<GremioResponse> getGremio(
            @AuthenticationPrincipal UserDetailsImpl user) {

        Gremio g = gremioRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));


        int totalAventureros = (int) aventureroRepository.countByGremioId(g.getId());
        int aventurasActivas = (int) aventuraRepository
                .countByGremioIdAndEstado(g.getId(), EstadoAventura.EN_CURSO);

        return ResponseEntity.ok(GremioResponse.builder()
                .id(g.getId())
                .nombre(g.getNombre())
                .oro(g.getOro())
                .nivelGremio(g.getNivelGremio())
                .maxAventuras(g.getMaxAventuras())
                .dificultadMax(g.getDificultadMax())
                .totalAventureros(totalAventureros)
                .aventurasActivas(aventurasActivas)
                .fechaCreacion(g.getFechaCreacion())
                .build());
    }

    @PutMapping("/nombre")
    public ResponseEntity<GremioResponse> renombrar(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam String nombre) {

        Gremio g = gremioRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        g.setNombre(nombre);
        gremioRepository.save(g);
        return getGremio(user);
    }
}
