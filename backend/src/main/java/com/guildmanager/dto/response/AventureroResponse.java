package com.guildmanager.dto.response;

import com.guildmanager.model.*;
import lombok.*;

@Data @Builder
public class AventureroResponse {
    private Long id;
    private String nombre;
    private Rol rol;
    private Rareza rareza;
    private int nivel;
    private long experiencia;
    private long expSiguienteNivel;
    private int vidaBase, ataqueBase, defensaBase, velocidadBase, suerteBase;
    private int vidaTotal, ataqueTotal, defensaTotal;
    private float criticoBase;
    private boolean habilidadOculta;
    private boolean evolucionado;
    private boolean enAventura;
    private ItemResponse arma;
    private ItemResponse armadura;
}
