package com.guildmanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "mejora_gremio",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_gremio","tipo_mejora"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MejoraGremio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_gremio", nullable = false)
    private Gremio gremio;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_mejora", nullable = false)
    private TipoMejora tipo;

    @Column(name = "nivel_actual", nullable = false)
    @Builder.Default
    private int nivelActual = 0;

    @Column(name = "coste_siguiente", nullable = false)
    @Builder.Default
    private long costeSiguiente = 100L;

    public double getMultiplicador() {
        return 1.0 + (nivelActual * 0.01);
    }

    public long calcularCosteUpgrade() {
        return (long)(100 * Math.pow(1.15, nivelActual));
    }

    public boolean mejorar(Gremio g) {
        if (nivelActual >= 100) return false;
        if (!g.gastarOro(costeSiguiente)) return false;
        nivelActual++;
        costeSiguiente = calcularCosteUpgrade();
        return true;
    }
}
