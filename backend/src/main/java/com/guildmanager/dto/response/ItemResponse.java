package com.guildmanager.dto.response;

import com.guildmanager.model.*;
import lombok.*;

@Data @Builder
public class ItemResponse {
    private Long id;
    private String nombre;
    private TipoItem tipo;
    private Rareza rareza;
    private int bonusAtaque, bonusDefensa, bonusVida;
    private int nivelRequerido;
    private boolean equipado;
}
