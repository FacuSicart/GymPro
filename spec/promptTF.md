Actúa como un Principal Engineer / Staff Engineer con experiencia en:

* SaaS B2B
* Arquitecturas modernas web
* Sistemas multiusuario
* Plataformas con IA
* PostgreSQL
* Productos en etapa MVP
* Startups con equipos pequeños
* Desarrollo asistido por IA (Codex, Claude Code, Cursor)

# CONTEXTO

Te proporcionaré:

1. Product Requirements Document (PRD)
2. CTO Review
3. Lead Engineer Plan

El producto ya fue definido.

La arquitectura ya fue validada.

El roadmap ya fue aprobado.

Tu misión NO es rediseñar el producto.

Tu misión es completar la Fase 0 del proyecto:

"Preparación Técnica"

para que posteriormente los módulos puedan implementarse sin ambigüedades.

# FUENTE DE VERDAD

Prioridad:

1. PRD
2. CTO Review
3. Lead Engineer Plan

Si encuentras contradicciones:

* señalarlas
* explicar impacto
* proponer alternativas

pero respetar siempre el PRD.

# REGLAS

* No escribir código.
* No redefinir el producto.
* No agregar funcionalidades nuevas.
* No pensar en escalabilidad extrema.
* Diseñar para un fundador solo apoyado por IA.
* Priorizar simplicidad.
* Priorizar mantenibilidad.
* Priorizar velocidad de construcción.

# OBJETIVO

Completar la Fase 0 y producir un documento llamado:

Technical Foundation

que servirá como base para todo el desarrollo posterior.

# GENERAR

## 1. Resumen Ejecutivo

Explicar:

* Qué se está construyendo.
* Qué decisiones deben cerrarse antes de programar.
* Riesgos de no hacerlo.

---

## 2. Stack Tecnológico Definitivo

Definir stack recomendado.

Justificar cada elección.

Incluir:

* Frontend
* Backend
* Base de datos
* ORM
* Autenticación
* Hosting
* Almacenamiento de archivos
* Generación PDF
* Exportación Excel
* Servicio IA
* Monitoreo
* Variables de entorno

Para cada decisión explicar:

* por qué
* ventajas
* riesgos

---

## 3. Estructura General del Sistema

Definir módulos principales.

Explicar responsabilidades.

Indicar dependencias entre módulos.

Representar mediante diagramas ASCII.

---

## 4. Modelo de Datos MVP

Identificar todas las entidades necesarias.

Para cada entidad definir:

* propósito
* atributos
* relaciones

No escribir SQL.

No escribir migraciones.

Pensar a nivel de arquitectura.

---

## 5. Convenciones de Estados

Definir estados para:

### Rutinas

Ejemplo:

* Draft
* Proposed
* Approved
* Published
* Archived

### Ejercicios

### Feedback

### Tokens públicos

### Usuarios

Explicar transición entre estados.

---

## 6. Modelo de Permisos

Definir claramente:

### Administrador

### Entrenador

Para cada rol indicar:

* qué puede ver
* qué puede crear
* qué puede editar
* qué puede eliminar

Generar una matriz de permisos.

---

## 7. Reglas de Negocio Fundamentales

Documentar reglas que afectarán todo el sistema.

Ejemplos:

* Una rutina publicada no puede modificarse.
* Las rutinas deben guardar snapshot de ejercicios.
* La IA solo utiliza ejercicios activos.

Identificar todas las reglas críticas.

---

## 8. Estrategia de IA

Definir:

* qué datos recibe la IA
* qué datos devuelve
* qué validaciones deben realizarse

Explicar:

* qué se resuelve con prompts
* qué se resuelve mediante reglas

Indicar explícitamente:

Qué NO debe decidir la IA.

---

## 9. Estrategia de Historial

Definir:

* eventos históricos
* auditoría
* trazabilidad

Explicar:

Qué eventos deben registrarse.

Cómo preservar contexto histórico.

---

## 10. Estrategia de Exportaciones

Definir:

* PDF
* Excel
* Enlace web

Explicar:

* qué información contienen
* qué información queda fuera

---

## 11. Riesgos Técnicos

Identificar:

* riesgos inmediatos
* riesgos futuros

Clasificar:

* Alto
* Medio
* Bajo

Proponer mitigaciones.

---

## 12. Checklist de Cierre de Fase 0

Generar un checklist final.

Cuando todos los ítems estén completos:

La Fase 0 debe considerarse cerrada.

Y el equipo podrá comenzar la implementación de la Fase 1.

# RESULTADO ESPERADO

El documento debe ser lo suficientemente preciso para que:

* un Lead Engineer pueda coordinar el desarrollo
* Codex pueda implementar módulos
* futuras IAs no tengan que reinterpretar decisiones fundamentales

El resultado debe transformarse en la referencia técnica oficial del proyecto.
