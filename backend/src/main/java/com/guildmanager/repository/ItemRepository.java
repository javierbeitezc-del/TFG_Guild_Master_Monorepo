package com.guildmanager.repository;

import com.guildmanager.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByGremioId(Long gremioId);
    List<Item> findByGremioIdAndEquipadoFalse(Long gremioId);
    List<Item> findByGremioIdAndTipo(Long gremioId, TipoItem tipo);
}
