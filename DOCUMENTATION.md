# Documentación Completa de Funcionalidades: FIFA Tracker PWA

Este documento detalla las mecánicas, criterios y funcionalidades del ecosistema FIFA Tracker PWA.

---

## 1. Sistema de Ranking y Puntuación
El corazón de la aplicación es su sistema de evaluación de desempeño, diseñado para recompensar tanto la calidad como la cantidad de juego.

### Fórmula de Puntuación
Se utiliza un puntaje compuesto basado en la siguiente fórmula:
`Score = (Wins * 300) + (Draws * 100) + (GoalDiff * 10) + (MatchesPlayed * 5)`

*   **Victorias (300 pts)**: El factor principal de éxito.
*   **Empates (100 pts)**: Reconocimiento al esfuerzo.
*   **Diferencia de Goles (10 pts por gol)**: Premia las victorias dominantes y penaliza las derrotas abultadas.
*   **Bonificación por Actividad (5 pts por partido)**: Un pequeño incentivo por participación que ayuda a desempatar a favor del jugador más activo.

### Mecanismo Anti "One-Game Wonder"
El puntaje es acumulativo. Esto garantiza que un jugador con un historial sólido (ej. 10 partidos con 5 victorias) siempre esté por encima de alguien que jugó un solo partido y lo ganó de suerte.

---

## 2. Gestión de Perfiles
Cada jugador tiene una identidad única y segura dentro de la plataforma.

### Identidad
*   **Avatares**: Personalización mediante emojis o fotos de perfil reales.
*   **PIN de Seguridad**: Acceso protegido por un PIN de 4 dígitos.
*   **Visibilidad**:
    *   **Público**: Aparece en la lista global de selección de perfil.
    *   **Privado**: Oculto de la lista global; solo puede ser encontrado mediante búsqueda exacta por nombre o escaneo de QR.

### Administración (Superadmin)
El usuario `fertau` posee privilegios de superadmin:
*   Mantenimiento de base de datos (eliminación de perfiles).
*   Limpieza global de torneos.

---

## 3. Partidos y Sesiones
El registro de partidos es flexible y admite múltiples configuraciones.

### Modos de Juego
*   **1v1**: Clásico uno contra uno.
*   **2v2**: Cooperativo competitivo.
*   **3v1 / Custom**: Modos especiales para desafíos específicos.

### Finalización de Partidos
*   **Regular**: El partido terminó naturalmente.
*   **Penales**: Permite registrar quién ganó la tanda de penales si el partido terminó en empate.
*   **Abandono (Forfeit)**: Registra la derrota automática para quien abandonó.

---

## 4. Sistema Social
Fomenta la conectividad entre jugadores manteniendo la privacidad.

### Amigos
*   **Solicitudes**: Sistema de invitaciones (Enviar, Aceptar, Rechazar).
*   **Descubrimiento**: Buscador integrado en las pantallas clave para encontrar nicknames exactos.
*   **QR Codes**: 
    *   **Mi QR**: Genera un código para que otros te agreguen.
    *   **Escáner**: Usa la cámara para agregar amigos instantáneamente sin escribir.

### Interacciones Sociales
*   **Likes**: Los jugadores pueden dar "Me Gusta" (corazón) a los hitos y noticias destacadas en el Dashboard.
*   **Feed de Novedades**: Sistema dinámico que agrupa sesiones de juego y destaca "Goleadas", "Clásicos" y nuevos récords.

---

## 5. Logros y Desempeño
La aplicación fomenta la maestría mediante el seguimiento de hitos personales.

### Sistema de Logros (Badges)
*   **Hat-trick**: Anotar 3 o más goles en un solo partido.
*   **Clean Sheet**: Ganar un partido manteniendo el arco en cero (0 goles en contra).
*   **Unbeatable**: Lograr una racha de 5 victorias consecutivas.
*   **Goal Machine**: Alcanzar un total de 50 goles anotados.
*   **Tournament King**: Ganar al menos un torneo oficial.

### Analítica Avanzada
*   **Evolución de Rendimiento**: Gráfico visual de tendencia que muestra la progresión del Score histórico.
*   **Tendencia de Goleo**: Indicador porcentual de mejora o declive en el promedio de goles por partido.

---

## 6. Torneos
Gestión de competencias estructuradas con persistencia de datos.

### Modos de Torneo
*   **Liga (League)**: Todos contra todos.
*   **Eliminación Directa (Knockout)**: Brackets tradicionales.

### Mecánicas
*   **Fixture Persistente**: Una vez realizado el sorteo, los cruces se guardan en el servidor para que todos los participantes puedan verlos.
*   **Privacidad**: Solo los participantes del torneo pueden acceder y ver los resultados del mismo.

---

### Automatización
*   **Auto-Finalizado**: El sistema detecta automáticamente cuando se han jugado todos los partidos de una liga o fase y activa la celebración del campeón.
*   **Avance de Llaves (Knockout)**: En torneos de eliminación directa, los ganadores avanzan automáticamente al siguiente slot del bracket al registrar el resultado.

---

## 7. Accesibilidad y PWA
Diseñado para sentirse como una aplicación nativa y ser accesible globalmente.

### Multi-Lenguaje
*   Configuración de idioma (Español / Inglés) persistente por perfil.
*   Traducción dinámica de la interfaz, estadísticas y secciones de perfil.

### Tecnología PWA
*   **Instalable**: Icono personalizado en la pantalla de inicio.
*   **Splash Screen**: Animación de carga de marca.
*   **Branding**: Interfaz "vibrant/glassmorphism" de alta gama optimizada para móviles.

