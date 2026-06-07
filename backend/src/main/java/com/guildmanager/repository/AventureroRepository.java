package com.guildmanager.repository;

import com.guildmanager.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AventureroRepository extends JpaRepository<Aventurero, Long> {
    List<Aventurero> findByGremioId(Long gremioId);
    List<Aventurero> findByGremioIdAndEnAventuraFalse(Long gremioId);
    long countByGremioId(Long gremioId);
    List<Aventurero> findByGremioIdAndRol(Long gremioId, Rol rol);
    List<Aventurero> findByGremioIdAndNivelAndNombre(Long gremioId, int nivel, String nombre);
}
