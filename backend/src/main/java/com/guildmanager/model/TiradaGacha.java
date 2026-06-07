package com.guildmanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "tirada_gacha")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TiradaGacha {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_gremio", nullable = false)
    private Gremio gremio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aventurero")
    private Aventurero aventurero;

    @Enumerated(EnumType.STRING)
    @Column(name = "rareza_obtenida", nullable = false)
    private Rareza rarezaObtenida;

    @Column(name = "coste_oro", nullable = false)
    private long costeOro;

    @Column(name = "fecha_tirada", nullable = false)
    @Builder.Default
    private LocalDateTime fechaTirada = LocalDateTime.now();
}
