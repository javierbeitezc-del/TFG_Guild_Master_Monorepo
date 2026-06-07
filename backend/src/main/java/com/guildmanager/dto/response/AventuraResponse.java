package com.guildmanager.dto.response;

import com.guildmanager.model.EstadoAventura;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class AventuraResponse {
    private Long id;
    private int dificultad;
    private EstadoAventura estado;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private long oroRecompensa;
    private long expRecompensa;
    private boolean recompensaReclamada;
    private List<AventureroResponse> equipo;
    private long segundosRestantes;
}
