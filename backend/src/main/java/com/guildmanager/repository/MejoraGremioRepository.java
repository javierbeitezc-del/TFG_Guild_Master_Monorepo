package com.guildmanager.repository;

import com.guildmanager.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MejoraGremioRepository extends JpaRepository<MejoraGremio, Long> {
    List<MejoraGremio> findByGremioId(Long gremioId);
    Optional<MejoraGremio> findByGremioIdAndTipo(Long gremioId, TipoMejora tipo);
}
