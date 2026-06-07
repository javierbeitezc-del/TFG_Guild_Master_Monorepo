package com.guildmanager.service;

import com.guildmanager.dto.request.*;
import com.guildmanager.dto.response.AuthResponse;
import com.guildmanager.exception.BusinessException;
import com.guildmanager.model.*;
import com.guildmanager.repository.*;
import com.guildmanager.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final GremioRepository gremioRepository;
    private final MejoraGremioRepository mejoraRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (usuarioRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("El email ya está registrado");
        if (usuarioRepository.existsByUsername(req.getUsername()))
            throw new BusinessException("El nombre de usuario ya está en uso");

        Usuario usuario = Usuario.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .build();
        usuario = usuarioRepository.save(usuario);

        // Crear gremio inicial
        String nombreGremio = (req.getNombreGremio() != null && !req.getNombreGremio().isBlank())
            ? req.getNombreGremio() : "Gremio de " + req.getUsername();

        Gremio gremio = Gremio.builder()
            .usuario(usuario)
            .nombre(nombreGremio)
            .oro(500L)
            .build();
        gremio = gremioRepository.save(gremio);

        // Crear mejoras iniciales
        Gremio finalGremio = gremio;
        List<MejoraGremio> mejoras = Arrays.stream(TipoMejora.values())
            .map(tipo -> MejoraGremio.builder()
                .gremio(finalGremio)
                .tipo(tipo)
                .nivelActual(0)
                .costeSiguiente(100L)
                .build())
            .toList();
        mejoraRepository.saveAll(mejoras);

        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        return AuthResponse.builder()
            .token(jwtUtils.generateToken(auth))
            .userId(usuario.getId())
            .username(usuario.getUsername())
            .email(usuario.getEmail())
            .build();
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        var usuario = usuarioRepository.findByEmail(req.getEmail()).orElseThrow();
        usuario.setUltimoAcceso(java.time.LocalDateTime.now());
        usuarioRepository.save(usuario);
        return AuthResponse.builder()
            .token(jwtUtils.generateToken(auth))
            .userId(userDetails.getId())
            .username(userDetails.getUsername())
            .email(userDetails.getEmail())
            .build();
    }
}
