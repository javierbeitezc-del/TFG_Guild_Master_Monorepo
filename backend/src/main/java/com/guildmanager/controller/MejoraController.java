package com.guildmanager.controller;

import com.guildmanager.dto.response.MejoraResponse;
import com.guildmanager.model.TipoMejora;
import com.guildmanager.security.UserDetailsImpl;
import com.guildmanager.service.MejoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mejoras")
@RequiredArgsConstructor
public class MejoraController {
    private final MejoraService mejoraService;

    @GetMapping
    public ResponseEntity<List<MejoraResponse>> getMejoras(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(mejoraService.getMejoras(user.getId()));
    }

    @PostMapping("/{tipo}/mejorar")
    public ResponseEntity<MejoraResponse> mejorar(
            @PathVariable TipoMejora tipo, @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(mejoraService.mejorar(user.getId(), tipo));
    }
}
