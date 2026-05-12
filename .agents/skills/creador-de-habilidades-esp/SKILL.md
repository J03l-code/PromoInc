---
name: creador-de-habilidades-esp
description: Crea y documenta nuevas habilidades (skills) en español para el agente Antigravity, siguiendo la estructura oficial y mejores prácticas de Google.
---

# Creador de Habilidades en Español

Esta habilidad permite al agente Antigravity diseñar y generar nuevas capacidades (skills) personalizadas para el workspace, asegurando que estén bien documentadas, sigan los estándares técnicos y sean fácilmente interpretables por la IA.

## Cuándo usar esta habilidad
*   Cuando el usuario solicita crear una "habilidad", "skill" o "nueva capacidad".
*   Cuando se detecta una tarea repetitiva en el repositorio que se beneficiaría de un conjunto de instrucciones estructuradas.
*   Para automatizar flujos de trabajo específicos (ej. despliegues, auditorías de código, generación de reportes) en español.

## Cómo usarla
1.  **Entender el Objetivo:** Pregunta o identifica qué debe hacer la nueva habilidad y bajo qué condiciones debe activarse.
2.  **Definir el Disparador (Trigger):** Redacta una descripción clara en el frontmatter YAML que explique exactamente cuándo el agente debe cargar esta habilidad.
3.  **Estructurar el Archivo SKILL.md:**
    *   **YAML Frontmatter:** Define `name` (en minúsculas con guiones) y `description`.
    *   **Sección "Cuándo usar":** Define los escenarios de uso.
    *   **Sección "Cómo usar":** Proporciona pasos imperativos y claros para que el agente ejecute la tarea.
    *   **Sección "Ejemplos":** (Opcional) Incluye ejemplos de entrada y salida para mayor precisión.
4.  **Ubicación:** Guarda el archivo siempre en `.agents/skills/[nombre-de-la-habilidad]/SKILL.md`.
5.  **Validación:** Asegúrate de que las instrucciones sean claras, concisas y orientadas a la acción (imperativas).

## Ejemplo de Estructura Correcta
```markdown
---
name: mi-nueva-habilidad
description: Descripción clara de lo que hace la habilidad y cuándo activarse.
---

# Nombre de la Habilidad

## Cuándo usar esta habilidad
*   Escenario 1...
*   Escenario 2...

## Cómo usarla
1. Paso 1...
2. Paso 2...

## Ejemplos
- Entrada: ...
- Salida: ...
```
