---
name: framer-design-system
description: Adapta el estilo visual de una página siguiendo el sistema de diseño de marketing de Framer (estética "Black Canvas", tipografía masiva con tracking negativo y spotlight cards).
---

# Framer Design System (Marketing Canvas)

Esta habilidad permite transformar interfaces convencionales en experiencias visuales de alto impacto basadas en la estética de marketing de Framer: minimalismo oscuro, tipografía técnica personalizada y explosiones controladas de color mediante gradientes.

## Cuándo usar esta habilidad
*   Cuando el usuario pide "aplicar el estilo Framer" o "rediseñar con estética de alto contraste oscura".
*   Para crear landings de producto que necesiten sentirse como "posters" digitales de alta gama.
*   Cuando se requiere una jerarquía visual basada en profundidad de superficie (canvas -> surface-1 -> surface-2) en lugar de sombras tradicionales.

## Cómo usarla

### 1. Paleta de Colores (Monocromía + 1 Acento)
*   **Canvas (`{colors.canvas}`):** Fondo casi negro con calidez mínima. Usar para todas las secciones principales.
*   **Ink (`{colors.ink}`):** Blanco puro para todos los encabezados y texto enfatizado.
*   **Accent Blue (`{colors.accent-blue}`):** Reservado EXCLUSIVAMENTE para hipervínculos, halos de selección y anillos de foco. Nunca para fondos.
*   **Surface-1/2:** Grises muy oscuros (charcoal) para elevar elementos (cards, botones secundarios).

### 2. Tipografía (El "Poster Grade")
*   **Tracking Negativo Extremo:** Los encabezados masivos DEBEN tener un letter-spacing negativo agresivo:
    *   Display XXL (110px): `-5.5px`
    *   Display XL (85px): `-4.25px`
    *   Display LG (62px): `-3.1px`
*   **Inter Variable:** Usar siempre con las variantes OpenType: `cv01`, `cv05`, `cv09`, `cv11`, `ss03`, `ss07`, `dlig`. Esto le da la voz técnica personalizada de Framer.

### 3. Componentes Firma (Signature)
*   **Gradient Spotlight Cards:** Insertar ocasionalmente tarjetas con gradientes vibrantes (Magenta, Violeta, Naranja o Coral) dentro de la cuadrícula oscura. Son tarjetas individuales, no fondos de sección.
*   **Botones Pill:** Todos los CTAs primarios son píldoras blancas (`border-radius: 100px`). Los secundarios son píldoras de carbón (charcoal). No usar botones fantasma con bordes.
*   **Radios de Borde:** 20px para tarjetas de contenido, 30px para tarjetas de gradiente.

### 4. Filosofía de Layout
*   **Rhythm Breaks:** Romper la monotonía del canvas negro cada pocas secciones con una tarjeta de gradiente vibrante.
*   **Espaciado:** Usar incrementos de 5px (5, 10, 15, 20, 30, 40, 96). Mantener mucho aire (respiro) arriba y abajo de cada afirmación asertiva.

## Ejemplo de Implementación CSS
```css
:root {
  --canvas: #18191d;
  --ink: #ffffff;
  --accent-blue: #0099ff;
  --surface-1: #26282d;
}

.headline-display {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 110px;
  letter-spacing: -5.5px;
  line-height: 0.85;
  color: var(--ink);
  font-feature-settings: 'cv11', 'ss03', 'ss07', 'cv01';
}
```

## Reglas Críticas (Do's & Don'ts)
*   **NO** crees un "light mode". La marca ES oscura.
*   **SÍ** usa el tracking negativo; sin él, no es estilo Framer.
*   **NO** uses gradientes como fondos de sección completos. Solo en tarjetas individuales.
*   **SÍ** mantén el azul solo para señales (links/foco).
