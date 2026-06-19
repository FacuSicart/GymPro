# Diagramas para posts de LinkedIn

## Cómo usarlos

1. Entrá a **mermaid.live**
2. Borrá el código de ejemplo
3. Pegá el bloque del diagrama que querés
4. Click en el ícono de descarga → PNG o SVG
5. Listo para subir a LinkedIn

---

## Diagrama 1 — Arquitectura general
### Para: post-03 (arquitectura) y post-01 (viaje con IA)

```mermaid
graph TB
    subgraph Usuarios
        A["🧑‍💼 Admin / Trainer\nDashboard Web"]
        B["📱 Alumno\nLink mobile-first\nsin app"]
    end

    subgraph Frontend["Frontend — Next.js 16 + Tailwind"]
        C["Dashboard interno"]
        D["Vista pública /r/token"]
    end

    subgraph API["Backend — NestJS REST API"]
        E["Auth & Usuarios"]
        F["Alumnos & Historial"]
        G["Catálogo de Ejercicios"]
        H["Rutinas & Snapshots"]
        I["Feedback & Alertas"]
        J["Sesiones & Plantillas"]
    end

    subgraph Datos
        K[("PostgreSQL\n+ Prisma ORM")]
        L["🤖 LLM\nIA Rutinas\n(próximo módulo)"]
    end

    A --> C
    B --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    C --> J
    D --> H
    D --> I
    E & F & G & H & I & J --> K
    H --> L

    style API fill:#f0f7ff,stroke:#2196F3
    style Datos fill:#f1f8e9,stroke:#66BB6A
    style Frontend fill:#fff8e1,stroke:#FFA726
```

---

## Diagrama 2 — Snapshot pattern
### Para: post-06 (snapshot) y post-03 (arquitectura)

```mermaid
sequenceDiagram
    actor Trainer as 🧑‍💼 Trainer
    participant API as NestJS API
    participant DB as PostgreSQL
    actor Alumno as 📱 Alumno

    Trainer->>API: Publica rutina
    API->>DB: Crea RoutineSnapshot
    Note over DB: Copia inmutable de todos<br/>los ejercicios en ese momento

    Note over Trainer,DB: Tiempo después...

    Trainer->>API: Edita ejercicio en catálogo
    API->>DB: Actualiza Exercise
    Note over DB: El snapshot NO cambia

    Alumno->>API: Abre /r/token
    API->>DB: Lee desde snapshot
    DB-->>API: Datos originales intactos
    API-->>Alumno: Rutina exacta que le dieron
```

---

## Diagrama 3 — Filosofía de IA
### Para: post-02 (filosofía IA)

```mermaid
flowchart LR
    subgraph Entrada["Contexto del alumno"]
        A["Objetivo\nExperiencia\nRestricciones"]
        B["Historial\nMolestias\nFeedback anterior"]
        C["Catálogo\nEjercicios aprobados\ny activos"]
    end

    subgraph IA["🤖 IA"]
        D["Genera borrador\ncon motivo por\nejercicio"]
    end

    subgraph Control["Control humano"]
        E["Trainer\nrevisa y edita"]
        F["Trainer\naprueba"]
    end

    G["📱 Alumno\nrecibe rutina"]

    A --> D
    B --> D
    C --> D
    D -->|"DRAFT\nnunca se entrega\nautomáticamente"| E
    E --> F
    F --> G

    style IA fill:#e3f2fd,stroke:#1976D2
    style Control fill:#e8f5e9,stroke:#388E3C
    style G fill:#fff8e1,stroke:#F57F17
```

---

## Diagrama 4 — Los 9 módulos
### Para: post-05 (9 módulos)

```mermaid
graph TD
    M1["1️⃣ Auth, Usuarios\nRoles & Tenant"]
    M2["2️⃣ Alumnos\ne Historial"]
    M3["3️⃣ Catálogo\nde Ejercicios"]
    M4["4️⃣ Rutinas"]
    M5["5️⃣ Link Público\nsin app"]
    M6["6️⃣ Sesiones\nde Entrenamiento"]
    M7["7️⃣ Feedback\npost-sesión"]
    M8["8️⃣ Alertas\nMolestias recurrentes"]
    M9["9️⃣ Plantillas\ny asignación masiva"]
    NEXT["🔜 IA de rutinas\nPDF / Excel"]

    M1 --> M2
    M1 --> M3
    M2 --> M4
    M3 --> M4
    M4 --> M5
    M5 --> M6
    M6 --> M7
    M7 --> M8
    M4 --> M9
    M8 --> NEXT

    style M1 fill:#e8eaf6,stroke:#5C6BC0
    style M2 fill:#e8eaf6,stroke:#5C6BC0
    style M3 fill:#e8eaf6,stroke:#5C6BC0
    style M4 fill:#e3f2fd,stroke:#1976D2
    style M5 fill:#e3f2fd,stroke:#1976D2
    style M6 fill:#e8f5e9,stroke:#388E3C
    style M7 fill:#e8f5e9,stroke:#388E3C
    style M8 fill:#e8f5e9,stroke:#388E3C
    style M9 fill:#fff3e0,stroke:#F57C00
    style NEXT fill:#fce4ec,stroke:#C62828,stroke-dasharray: 5 5
```

---

## Diagrama 5 — El viaje con IA
### Para: post-01 (viaje con IA) y post-07 (documentación)

```mermaid
flowchart TD
    A["💡 Idea de negocio\nProblema del entrenador"]

    subgraph Fase0["Fase 0 — Todo con IA, sin código"]
        B["📄 PRD completo\nIA como PM + BA + UX + Architect"]
        C["🔍 CTO Review\nValidación arquitectónica"]
        D["⚙️ Technical Foundation\nIA como Principal Engineer"]
        E["📋 Plan ejecutable\nIA como Lead Engineer"]
    end

    subgraph Impl["Implementación"]
        F["💻 Módulo 1"]
        G["💻 Módulo 2"]
        H["💻 ..."]
        I["💻 Módulo 9"]
    end

    J["🚀 Producto funcional\ncon tests y docs"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J

    style Fase0 fill:#fff8e1,stroke:#F9A825
    style Impl fill:#e8f5e9,stroke:#388E3C
    style J fill:#e3f2fd,stroke:#1976D2
```

---

## Diagrama 6 — Catálogo cerrado de ejercicios
### Para: post-02 (filosofía IA) o post-03 (arquitectura)

```mermaid
flowchart LR
    subgraph Propuestas["Fuentes de ejercicios"]
        A["🧑‍💼 Trainer\npropone"]
        B["🔧 Admin\ncrea directamente"]
        C["🤖 IA admin\ngenera en bulk"]
    end

    subgraph Estados["Estados del ejercicio"]
        D["PENDING\npendiente de revisión"]
        E["APPROVED\naprobado por admin"]
        F["ACTIVE\ndisponible para rutinas"]
    end

    subgraph Uso["Uso"]
        G["✅ Rutinas\nIA de rutinas"]
        H["❌ No disponible\npara rutinas"]
    end

    A --> D
    B --> D
    C --> D
    D -->|"Admin aprueba"| E
    E -->|"Admin activa"| F
    D -->|"Admin rechaza"| H
    F --> G

    style D fill:#fff3e0,stroke:#F57C00
    style E fill:#e3f2fd,stroke:#1976D2
    style F fill:#e8f5e9,stroke:#388E3C
    style H fill:#ffebee,stroke:#C62828
    style G fill:#e8f5e9,stroke:#388E3C
```

---

## Tips de exportación

- **Fondo blanco:** en mermaid.live, antes de exportar activá la opción "White background"
- **Tamaño LinkedIn:** el formato ideal para imagen de post es 1200 × 627 px. Podés escalar el PNG en cualquier editor de imágenes gratuito (Canva, Photopea, etc.)
- **Si querés agregar tu nombre o logo:** pegá el PNG exportado en Canva y agregale un margen con tu nombre abajo
