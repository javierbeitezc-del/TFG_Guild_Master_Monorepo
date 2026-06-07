-- ════════════════════════════════════════════════════════════════
-- GUILD MANAGER - Schema DDL - MySQL 8.0
-- Ejecutar: mysql -u guilduser -p guild_manager < schema.sql
-- ════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS guild_manager
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE guild_manager;

-- ── USUARIO ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario (
  id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(50)   NOT NULL UNIQUE,
  email           VARCHAR(100)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  avatar_url      VARCHAR(255),
  fecha_registro  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso   DATETIME,
  activo          BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ── GREMIO ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gremio (
  id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
  id_usuario      BIGINT        NOT NULL UNIQUE,
  nombre          VARCHAR(80)   NOT NULL,
  oro             BIGINT        NOT NULL DEFAULT 500,
  nivel_gremio    INT           NOT NULL DEFAULT 1,
  max_aventuras   INT           NOT NULL DEFAULT 1,
  dificultad_max  INT           NOT NULL DEFAULT 1,
  fecha_creacion  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gremio_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id) ON DELETE CASCADE
);

-- ── ITEM ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item (
  id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
  id_gremio       BIGINT        NOT NULL,
  nombre          VARCHAR(80)   NOT NULL,
  tipo            ENUM('ARMA','ARMADURA') NOT NULL,
  rareza          ENUM('COMUN','RARO','SUPER_RARO','SUPER_ULTRA_RARO','SECRETO') NOT NULL,
  bonus_ataque    INT           NOT NULL DEFAULT 0,
  bonus_defensa   INT           NOT NULL DEFAULT 0,
  bonus_vida      INT           NOT NULL DEFAULT 0,
  nivel_requerido INT           NOT NULL DEFAULT 1,
  equipado        BOOLEAN       NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_item_gremio FOREIGN KEY (id_gremio)
    REFERENCES gremio(id) ON DELETE CASCADE
);

-- ── AVENTURERO ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aventurero (
  id               BIGINT   AUTO_INCREMENT PRIMARY KEY,
  id_gremio        BIGINT   NOT NULL,
  nombre           VARCHAR(80) NOT NULL,
  rol              ENUM('GUERRERO','TANQUE','MAGO','ASESINO','SOPORTE') NOT NULL,
  rareza           ENUM('COMUN','RARO','SUPER_RARO','SUPER_ULTRA_RARO','SECRETO') NOT NULL,
  nivel            INT      NOT NULL DEFAULT 1,
  experiencia      BIGINT   NOT NULL DEFAULT 0,
  vida_base        INT      NOT NULL,
  ataque_base      INT      NOT NULL,
  defensa_base     INT      NOT NULL,
  velocidad_base   INT      NOT NULL,
  suerte_base      INT      NOT NULL,
  critico_base     FLOAT    NOT NULL DEFAULT 0.05,
  habilidad_oculta BOOLEAN  NOT NULL DEFAULT FALSE,
  evolucionado     BOOLEAN  NOT NULL DEFAULT FALSE,
  en_aventura      BOOLEAN  NOT NULL DEFAULT FALSE,
  id_arma          BIGINT,
  id_armadura      BIGINT,
  CONSTRAINT fk_av_gremio    FOREIGN KEY (id_gremio)   REFERENCES gremio(id)   ON DELETE CASCADE,
  CONSTRAINT fk_av_arma      FOREIGN KEY (id_arma)     REFERENCES item(id)     ON DELETE SET NULL,
  CONSTRAINT fk_av_armadura  FOREIGN KEY (id_armadura) REFERENCES item(id)     ON DELETE SET NULL
);

-- ── AVENTURA ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aventura (
  id                   BIGINT   AUTO_INCREMENT PRIMARY KEY,
  id_gremio            BIGINT   NOT NULL,
  dificultad           INT      NOT NULL,
  estado               ENUM('PENDIENTE','EN_CURSO','COMPLETADA','FALLIDA') NOT NULL DEFAULT 'EN_CURSO',
  fecha_inicio         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_fin            DATETIME,
  oro_recompensa       BIGINT   NOT NULL DEFAULT 0,
  exp_recompensa       BIGINT   NOT NULL DEFAULT 0,
  recompensa_reclamada BOOLEAN  NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_aventura_gremio FOREIGN KEY (id_gremio)
    REFERENCES gremio(id) ON DELETE CASCADE
);

-- ── AVENTURA_AVENTURERO (N:M) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS aventura_aventurero (
  id_aventura   BIGINT NOT NULL,
  id_aventurero BIGINT NOT NULL,
  posicion      INT    NOT NULL DEFAULT 1,
  PRIMARY KEY (id_aventura, id_aventurero),
  CONSTRAINT fk_aa_aventura   FOREIGN KEY (id_aventura)   REFERENCES aventura(id)   ON DELETE CASCADE,
  CONSTRAINT fk_aa_aventurero FOREIGN KEY (id_aventurero) REFERENCES aventurero(id) ON DELETE CASCADE
);

-- ── MEJORA_GREMIO ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mejora_gremio (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_gremio       BIGINT NOT NULL,
  tipo_mejora     ENUM('RATIO_DROP','SALUD','DANIO','CRITICO','SUERTE','MAX_AVENTURAS') NOT NULL,
  nivel_actual    INT    NOT NULL DEFAULT 0,
  coste_siguiente BIGINT NOT NULL DEFAULT 100,
  UNIQUE KEY uq_mejora (id_gremio, tipo_mejora),
  CONSTRAINT fk_mejora_gremio FOREIGN KEY (id_gremio)
    REFERENCES gremio(id) ON DELETE CASCADE
);

-- ── TIRADA_GACHA ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tirada_gacha (
  id              BIGINT   AUTO_INCREMENT PRIMARY KEY,
  id_gremio       BIGINT   NOT NULL,
  id_aventurero   BIGINT,
  rareza_obtenida ENUM('COMUN','RARO','SUPER_RARO','SUPER_ULTRA_RARO','SECRETO') NOT NULL,
  coste_oro       BIGINT   NOT NULL,
  fecha_tirada    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tirada_gremio     FOREIGN KEY (id_gremio)     REFERENCES gremio(id)     ON DELETE CASCADE,
  CONSTRAINT fk_tirada_aventurero FOREIGN KEY (id_aventurero) REFERENCES aventurero(id) ON DELETE SET NULL
);

-- ── ÍNDICES DE RENDIMIENTO ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_av_gremio    ON aventurero(id_gremio);
CREATE INDEX IF NOT EXISTS idx_av_aventura  ON aventura(id_gremio);
CREATE INDEX IF NOT EXISTS idx_item_gremio  ON item(id_gremio);
CREATE INDEX IF NOT EXISTS idx_tirada_gremio ON tirada_gacha(id_gremio);
CREATE INDEX IF NOT EXISTS idx_aventura_estado ON aventura(estado, fecha_fin);
