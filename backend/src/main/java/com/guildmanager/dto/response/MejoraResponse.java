package com.guildmanager.dto.response;

import com.guildmanager.model.TipoMejora;
import lombok.*;

@Data @Builder
public class MejoraResponse {
    private Long id;
    private TipoMejora tipo;
    private int nivelActual;
    private long costeSiguiente;
    private double multiplicador;
    private boolean maxNivel;
}
