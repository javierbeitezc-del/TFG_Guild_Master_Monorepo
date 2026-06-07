package com.guildmanager.repository;

import com.guildmanager.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AventuraRepository extends JpaRepository<Aventura, Long> {
    List<Aventura> findByGremioId(Long gremioId);
    List<Aventura> findByGremioIdAndEstado(Long gremioId, EstadoAventura estado);
    long countByGremioIdAndEstado(Long gremioId, EstadoAventura estado);

    @Query("SELECT a FROM Aventura a WHERE a.estado = 'EN_CURSO' AND a.fechaFin <= CURRENT_TIMESTAMP")
    List<Aventura> findAventurasParaFinalizar();
}
