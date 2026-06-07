package com.guildmanager.repository;

import com.guildmanager.model.TiradaGacha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TiradaGachaRepository extends JpaRepository<TiradaGacha, Long> {
    List<TiradaGacha> findByGremioIdOrderByFechaTiradaDesc(Long gremioId, Pageable pageable);
}
