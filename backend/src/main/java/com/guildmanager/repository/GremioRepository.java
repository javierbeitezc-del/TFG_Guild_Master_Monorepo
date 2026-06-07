package com.guildmanager.repository;

import com.guildmanager.model.Gremio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GremioRepository extends JpaRepository<Gremio, Long> {
    Optional<Gremio> findByUsuarioId(Long usuarioId);
}
