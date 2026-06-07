package com.guildmanager.service;

import com.guildmanager.dto.response.*;
import com.guildmanager.model.*;
import org.springframework.stereotype.Service;

@Service
public class AventureroMapperService {
    public AventureroResponse toResponse(Aventurero av) {
        return AventureroResponse.builder()
            .id(av.getId())
            .nombre(av.getNombre())
            .rol(av.getRol())
            .rareza(av.getRareza())
            .nivel(av.getNivel())
            .experiencia(av.getExperiencia())
            .expSiguienteNivel(av.expParaSiguienteNivel())
            .vidaBase(av.getVidaBase())
            .ataqueBase(av.getAtaqueBase())
            .defensaBase(av.getDefensaBase())
            .velocidadBase(av.getVelocidadBase())
            .suerteBase(av.getSuerteBase())
            .vidaTotal(av.getVidaTotal())
            .ataqueTotal(av.getAtaqueTotal())
            .defensaTotal(av.getDefensaTotal())
            .criticoBase(av.getCriticoBase())
            .habilidadOculta(av.isHabilidadOculta())
            .evolucionado(av.isEvolucionado())
            .enAventura(av.isEnAventura())
            .arma(av.getArma() != null ? itemToResponse(av.getArma()) : null)
            .armadura(av.getArmadura() != null ? itemToResponse(av.getArmadura()) : null)
            .build();
    }

    public ItemResponse itemToResponse(Item item) {
        return ItemResponse.builder()
            .id(item.getId())
            .nombre(item.getNombre())
            .tipo(item.getTipo())
            .rareza(item.getRareza())
            .bonusAtaque(item.getBonusAtaque())
            .bonusDefensa(item.getBonusDefensa())
            .bonusVida(item.getBonusVida())
            .nivelRequerido(item.getNivelRequerido())
            .equipado(item.isEquipado())
            .build();
    }
}
