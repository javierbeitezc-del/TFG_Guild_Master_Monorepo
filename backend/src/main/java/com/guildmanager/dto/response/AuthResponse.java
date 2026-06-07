package com.guildmanager.dto.response;

import lombok.*;

@Data @Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String email;
}
