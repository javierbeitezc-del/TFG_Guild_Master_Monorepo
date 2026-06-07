package com.guildmanager.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50)
    private String username;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8)
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).+$",
             message = "La contraseña debe tener al menos una mayúscula y un número")
    private String password;

    @Size(max = 80)
    private String nombreGremio;
}
