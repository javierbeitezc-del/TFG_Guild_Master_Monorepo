package com.guildmanager.controller;

import com.guildmanager.dto.request.IniciarAventuraRequest;
import com.guildmanager.dto.response.AventuraResponse;
import com.guildmanager.security.UserDetailsImpl;
import com.guildmanager.service.AventuraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/aventuras")
@RequiredArgsConstructor
public class AventuraController {
    private final AventuraService aventuraService;

    @GetMapping
    public ResponseEntity<List<AventuraResponse>> getAll(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(aventuraService.getAventuras(user.getId()));
    }

    @PostMapping
    public ResponseEntity<AventuraResponse> iniciar(
            @Valid @RequestBody IniciarAventuraRequest req,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aventuraService.iniciarAventura(user.getId(), req));
    }

    @PostMapping("/{id}/reclamar")
    public ResponseEntity<AventuraResponse> reclamar(
            @PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(aventuraService.reclamarRecompensa(user.getId(), id));
    }
}
