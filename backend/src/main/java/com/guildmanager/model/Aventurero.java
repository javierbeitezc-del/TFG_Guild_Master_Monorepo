package com.guildmanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "aventurero")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Aventurero {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_gremio", nullable = false)
    private Gremio gremio;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rareza rareza;

    @Column(nullable = false)
    @Builder.Default
    private int nivel = 1;

    @Column(nullable = false)
    @Builder.Default
    private long experiencia = 0L;

    @Column(name = "vida_base", nullable = false)
    private int vidaBase;

    @Column(name = "ataque_base", nullable = false)
    private int ataqueBase;

    @Column(name = "defensa_base", nullable = false)
    private int defensaBase;

    @Column(name = "velocidad_base", nullable = false)
    private int velocidadBase;

    @Column(name = "suerte_base", nullable = false)
    private int suerteBase;

    @Column(name = "critico_base", nullable = false)
    @Builder.Default
    private float criticoBase = 0.05f;

    @Column(name = "habilidad_oculta", nullable = false)
    @Builder.Default
    private boolean habilidadOculta = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean evolucionado = false;

    @Column(name = "en_aventura", nullable = false)
    @Builder.Default
    private boolean enAventura = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_arma")
    private Item arma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_armadura")
    private Item armadura;

    public double getMultiplicadorRareza() {
        return switch (rareza) {
            case COMUN -> 1.1;
            case RARO -> 1.5;
            case SUPER_RARO -> 2.0;
            case SUPER_ULTRA_RARO -> 4.0;
            case SECRETO -> 10.0;
        };
    }

    public int getVidaTotal() {
        int bonus = (arma != null ? arma.getBonusVida() : 0) + (armadura != null ? armadura.getBonusVida() : 0);
        return (int)((vidaBase + bonus) * getMultiplicadorRareza() * (1 + (nivel - 1) * 0.05));
    }

    public int getAtaqueTotal() {
        int bonus = (arma != null ? arma.getBonusAtaque() : 0);
        return (int)((ataqueBase + bonus) * getMultiplicadorRareza() * (1 + (nivel - 1) * 0.05));
    }

    public int getDefensaTotal() {
        int bonus = (armadura != null ? armadura.getBonusDefensa() : 0);
        return (int)((defensaBase + bonus) * getMultiplicadorRareza() * (1 + (nivel - 1) * 0.05));
    }

    public long expParaSiguienteNivel() {
        return (long)(100 * Math.pow(nivel, 1.5));
    }

    public void ganarExperiencia(long experienciaGanada) {
        this.experiencia += experienciaGanada;
    }
    public boolean subirNivel() {
        if (nivel >= 100) return false;
        if (experiencia >= expParaSiguienteNivel()) {
            experiencia -= expParaSiguienteNivel();
            nivel++;
            return true;
        }
        return false;
    }
}
