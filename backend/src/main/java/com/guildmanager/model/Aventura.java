package com.guildmanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "aventura")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Aventura {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_gremio", nullable = false)
    private Gremio gremio;

    @Column(nullable = false)
    private int dificultad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoAventura estado = EstadoAventura.EN_CURSO;

    @Column(name = "fecha_inicio", nullable = false)
    @Builder.Default
    private LocalDateTime fechaInicio = LocalDateTime.now();

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "oro_recompensa", nullable = false)
    @Builder.Default
    private long oroRecompensa = 0L;

    @Column(name = "exp_recompensa", nullable = false)
    @Builder.Default
    private long expRecompensa = 0L;

    @Column(name = "recompensa_reclamada", nullable = false)
    @Builder.Default
    private boolean recompensaReclamada = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "aventura_aventurero",
        joinColumns = @JoinColumn(name = "id_aventura"),
        inverseJoinColumns = @JoinColumn(name = "id_aventurero")
    )
    @Builder.Default
    private List<Aventurero> equipo = new ArrayList<>();

    public boolean estaCompletada() {
        return estado == EstadoAventura.COMPLETADA;
    }

    public boolean listaParaReclamar() {
        return estaCompletada() && !recompensaReclamada;
    }
}
