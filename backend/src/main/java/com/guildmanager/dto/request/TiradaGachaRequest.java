package com.guildmanager.dto.request;

import lombok.Data;

@Data
public class TiradaGachaRequest {
    private boolean multiple = false; // false = x1, true = x10
}
