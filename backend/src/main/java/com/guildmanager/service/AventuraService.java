package com.guildmanager.service;

import com.guildmanager.dto.request.IniciarAventuraRequest;
import com.guildmanager.dto.response.AventuraResponse;
import com.guildmanager.dto.response.AventureroResponse;
import com.guildmanager.exception.*;
import com.guildmanager.model.*;
import com.guildmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AventuraService {
    private final AventuraRepository aventuraRepository;
    private final GremioRepository gremioRepository;
    private final AventureroRepository aventureroRepository;
    private final ItemRepository itemRepository;
    private final AventureroMapperService mapperService;

    @Value("${guild-manager.aventura.duracion-base-segundos:60}")
    private long duracionBase;

    @Transactional
    public AventuraResponse iniciarAventura(Long usuarioId, IniciarAventuraRequest req) {
        Gremio gremio = gremioRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));

        long activas = aventuraRepository.countByGremioIdAndEstado(gremio.getId(), EstadoAventura.EN_CURSO);
        if (activas >= gremio.getMaxAventuras())
            throw new BusinessException("Has alcanzado el máximo de aventuras simultáneas (" + gremio.getMaxAventuras() + ")");

        List<Aventurero> equipo = new ArrayList<>();
        for (Long avId : req.getAventureroIds()) {
            Aventurero av = aventureroRepository.findById(avId)
                .orElseThrow(() -> new ResourceNotFoundException("Aventurero " + avId + " no encontrado"));
            if (av.isEnAventura())
                throw new BusinessException("El aventurero " + av.getNombre() + " ya está en otra aventura");
            if (!av.getGremio().getId().equals(gremio.getId()))
                throw new BusinessException("El aventurero no pertenece a tu gremio");
            av.setEnAventura(true);
            equipo.add(av);
        }
        aventureroRepository.saveAll(equipo);

        long duracion = (duracionBase + (long)(req.getDificultad() * 60));
        LocalDateTime fin = LocalDateTime.now().plusSeconds(duracion);

        long oroBase = (long)(50 * req.getDificultad() * (1 + Math.random() * 0.5));
        long expBase  = (long)(30 * req.getDificultad());

        Aventura aventura = Aventura.builder()
            .gremio(gremio)
            .dificultad(req.getDificultad())
            .estado(EstadoAventura.EN_CURSO)
            .fechaInicio(LocalDateTime.now())
            .fechaFin(fin)
            .oroRecompensa(oroBase)
            .expRecompensa(expBase)
            .equipo(equipo)
            .build();

        aventura = aventuraRepository.save(aventura);
        return toResponse(aventura);
    }

    @Transactional
    public AventuraResponse reclamarRecompensa(Long usuarioId, Long aventuraId) {
        Aventura aventura = aventuraRepository.findById(aventuraId)
            .orElseThrow(() -> new ResourceNotFoundException("Aventura no encontrada"));

        Gremio gremio = aventura.getGremio();
        if (!gremio.getUsuario().getId().equals(usuarioId))
            throw new BusinessException("No tienes acceso a esta aventura");

        if (!aventura.listaParaReclamar())
            throw new BusinessException("La aventura no está lista para reclamar");

        gremio.ganarOro(aventura.getOroRecompensa());

        for (Aventurero av : aventura.getEquipo()) {
            av.ganarExperiencia(aventura.getExpRecompensa() / aventura.getEquipo().size());
            while (av.subirNivel()) {}
            av.setEnAventura(false);
        }

        if (aventura.getDificultad() > gremio.getDificultadMax())
            gremio.setDificultadMax(aventura.getDificultad());


        if (Math.random() < 0.30) {
            Item item = generarItemDrop(gremio, aventura.getDificultad());
            itemRepository.save(item);
        }

        aventura.setRecompensaReclamada(true);
        aventuraRepository.save(aventura);
        aventureroRepository.saveAll(aventura.getEquipo());
        gremioRepository.save(gremio);

        return toResponse(aventura);
    }
    @Transactional(readOnly = true)
    public List<AventuraResponse> getAventuras(Long usuarioId) {
        Gremio gremio = gremioRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Gremio no encontrado"));
        return aventuraRepository.findByGremioId(gremio.getId()).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    private Item generarItemDrop(Gremio gremio, int dificultad) {
        Random rng = new Random();
        TipoItem tipo = rng.nextBoolean() ? TipoItem.ARMA : TipoItem.ARMADURA;
        Rareza rareza = dificultad >= 10 ? Rareza.SUPER_RARO
            : dificultad >= 5 ? Rareza.RARO : Rareza.COMUN;
        int bonus = dificultad * 5 + rng.nextInt(dificultad * 3 + 1);
        String[] armas = {"Espada de Acero", "Hacha Brutal", "Daga Sombría", "Bastón Mágico", "Arco de Madera"};
        String[] armaduras = {"Cota de Malla", "Escudo de Roble", "Peto de Hierro", "Manto de Seda", "Armadura de Placas"};
        String nombre = tipo == TipoItem.ARMA
            ? armas[rng.nextInt(armas.length)]
            : armaduras[rng.nextInt(armaduras.length)];
        return Item.builder()
            .gremio(gremio)
            .nombre(nombre)
            .tipo(tipo)
            .rareza(rareza)
            .bonusAtaque(tipo == TipoItem.ARMA ? bonus : 0)
            .bonusDefensa(tipo == TipoItem.ARMADURA ? bonus : 0)
            .bonusVida(bonus / 2)
            .nivelRequerido(Math.max(1, dificultad * 5))
            .build();
    }

    private AventuraResponse toResponse(Aventura a) {
        long segundos = 0;
        if (a.getEstado() == EstadoAventura.EN_CURSO && a.getFechaFin() != null) {
            segundos = java.time.Duration.between(
                    LocalDateTime.now(), a.getFechaFin()).getSeconds();
            if (segundos < 0) segundos = 0;
        }
        List<AventureroResponse> equipoResponse;
        try {
            equipoResponse = a.getEquipo().stream()
                    .map(mapperService::toResponse)
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            equipoResponse = java.util.Collections.emptyList();
        }

        return AventuraResponse.builder()
                .id(a.getId())
                .dificultad(a.getDificultad())
                .estado(a.getEstado())
                .fechaInicio(a.getFechaInicio())
                .fechaFin(a.getFechaFin())
                .oroRecompensa(a.getOroRecompensa())
                .expRecompensa(a.getExpRecompensa())
                .recompensaReclamada(a.isRecompensaReclamada())
                .equipo(equipoResponse)
                .segundosRestantes(segundos)
                .build();
    }
}
