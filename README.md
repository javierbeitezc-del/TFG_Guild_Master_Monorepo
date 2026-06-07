# 🏰 Guild Manager — TFG DAM 2024-2025

Juego web de gestión y estrategia con sistema gacha, aventuras automáticas y progresión de personajes.

## Stack tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite 5                 |
| Backend    | Java 21 + Spring Boot 3.3         |
| Base datos | MySQL 8.0                         |
| Auth       | JWT (HS256) + BCrypt              |
| Deploy     | Docker Compose                    |

## Inicio rápido

### Con Docker Compose (recomendado)
```bash
docker-compose up -d
# Frontend → http://localhost
# Backend  → http://localhost:8080
# API docs → http://localhost:8080/actuator/health
```

### Sin Docker

**Backend:**
```bash
# 1. Crear base de datos MySQL
mysql -u root -p -e "CREATE DATABASE guild_manager; CREATE USER 'guilduser'@'localhost' IDENTIFIED BY 'guildpass'; GRANT ALL ON guild_manager.* TO 'guilduser'@'localhost';"

# 2. Compilar y ejecutar
cd backend
mvn clean package -DskipTests
java -jar target/guild-manager-backend-1.0.0.jar
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Funcionalidades

- **Sistema de usuarios**: registro, login con JWT
- **Gremio**: gestión, oro, límite de 50 aventureros
- **Gacha**: tiradas x1 / x10 con 5 rarezas y probabilidades reales
- **Aventureros**: 5 roles (Guerrero, Tanque, Mago, Asesino, Soporte), nivel 1-100, habilidades ocultas al evolucionar
- **Aventuras**: hasta 10 simultáneas, dificultad infinita, recompensas automáticas
- **Inventario**: armas y armaduras con stats, equipamiento por aventurero
- **Mejoras del gremio**: 6 mejoras hasta nivel 100

## Estructura del proyecto

```
guild-manager/
├── backend/          # Spring Boot (Java 21)
├── frontend/         # React + Vite
├── docker-compose.yml
└── README.md
```

## Versiones requeridas (sin Docker)

- Java 21 (LTS)
- Maven 3.9+
- Node.js 20 LTS
- MySQL 8.0
