package com.guildmanager.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class IniciarAventuraRequest {
    @Min(1) private int dificultad;

    @NotNull @Size(min = 1, max = 5)
    private List<Long> aventureroIds;
}
