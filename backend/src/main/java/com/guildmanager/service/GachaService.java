package com.guildmanager.service;

import com.guildmanager.dto.response.*;
import com.guildmanager.exception.BusinessException;
import com.guildmanager.model.*;
import com.guildmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GachaService {
    private final GremioRepository gremioRepository;
    private final AventureroRepository aventureroRepository;
    private final TiradaGachaRepository tiradaRepository;
    private final AventureroMapperService mapperService;

    @Value("${guild-manager.gacha.coste-x1:100}")
    private long COSTE_X1;

    @Value("${guild-manager.gacha.coste-x10:900}")
    private long COSTE_X10;

    private static final Random RNG = new Random();

    private static final Map<Rareza, Integer> DIFICULTAD_DESBLOQUEO = Map.of(
        Rareza.COMUN, 0,
        Rareza.RARO, 0,
        Rareza.SUPER_RARO, 2,
        Rareza.SUPER_ULTRA_RARO, 5,
        Rareza.SECRETO, 10
    );

    private static final String[][] NOMBRES_POR_ROL = {
        {"Thorin", "Garen", "Leonidas", "Brom", "Aldric"},
        {"Shield", "Aegis", "Bulwark", "Fortress", "Bastion"},
        {"Merlin", "Seraphina", "Elara", "Vex", "Zephyr"},
        {"Shadow", "Kira", "Vex", "Nyx", "Shiv"},
        {"Aria", "Lyric", "Sable", "Lumina", "Sage"}
    };

    @Transactional
    public GachaResultResponse tirar(Long usuarioId, boolean multiple) {
        Gremio gremio = gremioRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new BusinessException("Gremio no encontrado"));

        int cantidad = multiple ? 10 : 1;
        long coste = multiple ? COSTE_X10 : COSTE_X1;

        if (gremio.getOro() < coste)
            throw new BusinessException("Oro insuficiente. Necesitas " + coste + " oro");

        if (!gremio.puedeReclutarAventurero())
            throw new BusinessException("El gremio está lleno (50 aventureros máximo)");

        gremio.gastarOro(coste);

        List<AventureroResponse> resultados = new ArrayList<>();
        List<Boolean> fueroEvolucion = new ArrayList<>();

        for (int i = 0; i < cantidad; i++) {
            Rareza rareza = calcularRareza(gremio.getDificultadMax());
            Rol rol = Rol.values()[RNG.nextInt(Rol.values().length)];

            Aventurero av = generarAventurero(gremio, rareza, rol);

            // Comprobar si es duplicado al nivel 100
            List<Aventurero> duplicados = aventureroRepository
                .findByGremioIdAndNivelAndNombre(gremio.getId(), 100, av.getNombre());

            boolean esEvolucion = false;
            if (!duplicados.isEmpty()) {
                Aventurero original = duplicados.get(0);
                original.setEvolucionado(true);
                original.setHabilidadOculta(true);
                aventureroRepository.save(original);
                esEvolucion = true;
                resultados.add(mapperService.toResponse(original));
            } else {
                av = aventureroRepository.save(av);
                resultados.add(mapperService.toResponse(av));
            }
            fueroEvolucion.add(esEvolucion);

            TiradaGacha tirada = TiradaGacha.builder()
                .gremio(gremio)
                .aventurero(esEvolucion ? duplicados.get(0) : av)
                .rarezaObtenida(rareza)
                .costeOro(multiple ? COSTE_X10 / 10 : COSTE_X1)
                .build();
            tiradaRepository.save(tirada);
        }

        gremioRepository.save(gremio);

        return GachaResultResponse.builder()
            .aventureros(resultados)
            .oroGastado(coste)
            .oroRestante(gremio.getOro())
            .fueEvolucion(fueroEvolucion)
            .build();
    }

    private Rareza calcularRareza(int dificultadMax) {
        double roll = RNG.nextDouble() * 100.0;
        if (dificultadMax >= 10 && roll < 0.0001) return Rareza.SECRETO;
        if (dificultadMax >= 5  && roll < 1.0)    return Rareza.SUPER_ULTRA_RARO;
        if (dificultadMax >= 2  && roll < 10.0)   return Rareza.SUPER_RARO;
        if (roll < 40.0) return Rareza.RARO;
        return Rareza.COMUN;
    }

    private Aventurero generarAventurero(Gremio gremio, Rareza rareza, Rol rol) {
        double mult = switch (rareza) {
            case COMUN -> 1.1; case RARO -> 1.5;
            case SUPER_RARO -> 2.0; case SUPER_ULTRA_RARO -> 4.0; case SECRETO -> 10.0;
        };
        int[] baseStats = switch (rol) {
            case GUERRERO -> new int[]{200, 50, 40, 45, 30};
            case TANQUE    -> new int[]{350, 30, 80, 25, 20};
            case MAGO      -> new int[]{130, 90, 25, 55, 45};
            case ASESINO   -> new int[]{120, 80, 20, 80, 60};
            case SOPORTE   -> new int[]{150, 25, 30, 50, 55};
        };
        int rolIdx = rol.ordinal();
        String[] nombres = NOMBRES_POR_ROL[rolIdx];
        String nombre = nombres[RNG.nextInt(nombres.length)];

        return Aventurero.builder()
            .gremio(gremio)
            .nombre(nombre)
            .rol(rol)
            .rareza(rareza)
            .nivel(1)
            .vidaBase((int)(baseStats[0] * mult))
            .ataqueBase((int)(baseStats[1] * mult))
            .defensaBase((int)(baseStats[2] * mult))
            .velocidadBase((int)(baseStats[3] * mult))
            .suerteBase((int)(baseStats[4] * mult))
            .criticoBase(0.05f + (float)(rolIdx == 3 ? 0.15 : 0))
            .build();
    }
}
