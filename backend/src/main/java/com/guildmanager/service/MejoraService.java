package com.guildmanager.service;

import com.guildmanager.dto.response.MejoraResponse;
import com.guildmanager.exception.*;
import com.guildmanager.model.*;
import com.guildmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MejoraService {
    private final MejoraGremioRepository mejoraRepository;
    private final GremioRepository gremioRepository;

    public List<MejoraResponse> getMejoras(Long usuarioId) {
        Gremio gremio = gremioRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        return mejoraRepository.findByGremioId(gremio.getId()).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MejoraResponse mejorar(Long usuarioId, TipoMejora tipo) {
        Gremio gremio = gremioRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        MejoraGremio mejora = mejoraRepository.findByGremioIdAndTipo(gremio.getId(), tipo)
            .orElseThrow(() -> new ResourceNotFoundException("Mejora no encontrada"));

        if (mejora.getNivelActual() >= 100)
            throw new BusinessException("Esta mejora ya está al nivel máximo");
        if (!mejora.mejorar(gremio))
            throw new BusinessException("Oro insuficiente para esta mejora");

        if (tipo == TipoMejora.MAX_AVENTURAS) {
            int nuevasAventuras = Math.min(10, 1 + mejora.getNivelActual() / 10);
            gremio.setMaxAventuras(nuevasAventuras);
        }

        gremioRepository.save(gremio);
        mejoraRepository.save(mejora);
        return toResponse(mejora);
    }

    private MejoraResponse toResponse(MejoraGremio m) {
        return MejoraResponse.builder()
            .id(m.getId()).tipo(m.getTipo())
            .nivelActual(m.getNivelActual())
            .costeSiguiente(m.getCosteSiguiente())
            .multiplicador(m.getMultiplicador())
            .maxNivel(m.getNivelActual() >= 100)
            .build();
    }
}
