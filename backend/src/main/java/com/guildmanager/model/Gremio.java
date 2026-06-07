package com.guildmanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "gremio")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Gremio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false)
    @Builder.Default
    private long oro = 500L;

    @Column(name = "nivel_gremio", nullable = false)
    @Builder.Default
    private int nivelGremio = 1;

    @Column(name = "max_aventuras", nullable = false)
    @Builder.Default
    private int maxAventuras = 1;

    @Column(name = "dificultad_max", nullable = false)
    @Builder.Default
    private int dificultadMax = 1;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @OneToMany(mappedBy = "gremio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Aventurero> aventureros = new ArrayList<>();

    @OneToMany(mappedBy = "gremio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Item> items = new ArrayList<>();

    @OneToMany(mappedBy = "gremio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Aventura> aventuras = new ArrayList<>();

    @OneToMany(mappedBy = "gremio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MejoraGremio> mejoras = new ArrayList<>();

    public boolean gastarOro(long cantidad) {
        if (this.oro < cantidad) return false;
        this.oro -= cantidad;
        return true;
    }

    public void ganarOro(long cantidad) {
        this.oro += cantidad;
    }

    public boolean puedeReclutarAventurero() {
        return aventureros.size() < 50;
    }
}
