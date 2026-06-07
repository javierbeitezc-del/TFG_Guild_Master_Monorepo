package com.guildmanager.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class GremioResponse {
    private Long id;
    private String nombre;
    private long oro;
    private int nivelGremio;
    private int maxAventuras;
    private int dificultadMax;
    private int totalAventureros;
    private int aventurasActivas;
    private LocalDateTime fechaCreacion;
}
