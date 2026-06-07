package com.guildmanager.dto.response;

import com.guildmanager.model.Rareza;
import lombok.*;
import java.util.List;

@Data @Builder
public class GachaResultResponse {
    private List<AventureroResponse> aventureros;
    private long oroGastado;
    private long oroRestante;
    private List<Boolean> fueEvolucion;
}
