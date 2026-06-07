package com.guildmanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "item")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_gremio", nullable = false)
    private Gremio gremio;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoItem tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rareza rareza;

    @Column(name = "bonus_ataque", nullable = false)
    @Builder.Default
    private int bonusAtaque = 0;

    @Column(name = "bonus_defensa", nullable = false)
    @Builder.Default
    private int bonusDefensa = 0;

    @Column(name = "bonus_vida", nullable = false)
    @Builder.Default
    private int bonusVida = 0;

    @Column(name = "nivel_requerido", nullable = false)
    @Builder.Default
    private int nivelRequerido = 1;

    @Column(nullable = false)
    @Builder.Default
    private boolean equipado = false;
}
