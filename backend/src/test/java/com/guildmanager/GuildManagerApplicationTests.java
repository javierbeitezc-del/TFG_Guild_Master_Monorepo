package com.guildmanager;

import com.guildmanager.model.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class GuildManagerApplicationTests {

    @Test
    void aventureroSubeNivel() {
        Aventurero av = Aventurero.builder()
            .nombre("Test") .rol(Rol.GUERRERO) .rareza(Rareza.COMUN)
            .nivel(1) .experiencia(0L)
            .vidaBase(200) .ataqueBase(50) .defensaBase(40)
            .velocidadBase(45) .suerteBase(30) .build();

        av.ganarExperiencia(200L);
        boolean subio = av.subirNivel();
        assertTrue(subio, "El aventurero debería subir de nivel con suficiente XP");
        assertEquals(2, av.getNivel());
    }

    @Test
    void gremioNoGastaOroSiNoAlcanza() {
        Gremio g = Gremio.builder()
            .nombre("Test Guild") .oro(50L) .build();
        boolean resultado = g.gastarOro(100L);
        assertFalse(resultado, "No debería poder gastar más oro del disponible");
        assertEquals(50L, g.getOro());
    }

    @Test
    void gremioGastaOroCorrectamente() {
        Gremio g = Gremio.builder()
            .nombre("Test Guild") .oro(500L) .build();
        boolean resultado = g.gastarOro(100L);
        assertTrue(resultado);
        assertEquals(400L, g.getOro());
    }

    @Test
    void mejoraGremioCalculaCosteCreciente() {
        MejoraGremio m = MejoraGremio.builder()
            .tipo(TipoMejora.SALUD) .nivelActual(0) .costeSiguiente(100L) .build();
        long coste0 = m.calcularCosteUpgrade();
        m.setNivelActual(10);
        long coste10 = m.calcularCosteUpgrade();
        assertTrue(coste10 > coste0, "El coste debe crecer con el nivel");
    }

    @Test
    void statsAventureroConRarezaSecreto() {
        Aventurero av = Aventurero.builder()
            .nombre("Legend") .rol(Rol.MAGO) .rareza(Rareza.SECRETO)
            .nivel(1) .experiencia(0L)
            .vidaBase(130) .ataqueBase(90) .defensaBase(25)
            .velocidadBase(55) .suerteBase(45) .build();
        // Multiplicador SECRETO = x10
        assertEquals((int)(130 * 10.0), av.getVidaTotal());
        assertEquals((int)(90  * 10.0), av.getAtaqueTotal());
    }
}
