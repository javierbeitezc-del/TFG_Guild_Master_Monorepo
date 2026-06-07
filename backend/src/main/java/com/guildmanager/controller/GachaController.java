package com.guildmanager.controller;

import com.guildmanager.dto.response.GachaResultResponse;
import com.guildmanager.exception.ResourceNotFoundException;
import com.guildmanager.model.*;
import com.guildmanager.repository.*;
import com.guildmanager.security.UserDetailsImpl;
import com.guildmanager.service.GachaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gacha")
@RequiredArgsConstructor
public class GachaController {

    private final GachaService gachaService;
    private final TiradaGachaRepository tiradaRepository;
    private final GremioRepository gremioRepository;

    @PostMapping("/tirada")
    public ResponseEntity<GachaResultResponse> tirarX1(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(gachaService.tirar(user.getId(), false));
    }

    @PostMapping("/tirada-multiple")
    public ResponseEntity<GachaResultResponse> tirarX10(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(gachaService.tirar(user.getId(), true));
    }

    @GetMapping("/historial")
    @Transactional(readOnly = true)
    public ResponseEntity<List<HistorialDTO>> historial(
            @AuthenticationPrincipal UserDetailsImpl user) {
        Gremio gremio = gremioRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));

        List<HistorialDTO> resultado = tiradaRepository
                .findByGremioIdOrderByFechaTiradaDesc(gremio.getId(), PageRequest.of(0, 50))
                .stream()
                .map(t -> new HistorialDTO(
                        t.getId(),
                        t.getRarezaObtenida().name(),
                        t.getCosteOro(),
                        t.getFechaTirada().toString(),
                        t.getAventurero() != null ? t.getAventurero().getNombre() : null
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }


    public record HistorialDTO(
            Long id,
            String rarezaObtenida,
            long costeOro,
            String fechaTirada,
            String nombreAventurero
    ) {}
}
