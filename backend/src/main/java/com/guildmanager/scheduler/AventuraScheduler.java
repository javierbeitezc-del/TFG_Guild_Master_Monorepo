package com.guildmanager.scheduler;

import com.guildmanager.model.*;
import com.guildmanager.repository.AventuraRepository;
import com.guildmanager.repository.AventureroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AventuraScheduler {
    private final AventuraRepository aventuraRepository;
    private final AventureroRepository aventureroRepository;

    @Scheduled(fixedRate = 10000) // cada 10 segundos
    @Transactional
    public void procesarAventurasTerminadas() {
        List<Aventura> aventuras = aventuraRepository.findAventurasParaFinalizar();
        for (Aventura aventura : aventuras) {
            aventura.setEstado(EstadoAventura.COMPLETADA);
            aventuraRepository.save(aventura);
            log.debug("Aventura {} completada (dificultad {})", aventura.getId(), aventura.getDificultad());
        }
    }
}
