



- ✅ Implementar paginación en el listado
- ✅ Agregar filtros avanzados (rango de fechas)
- ❌ Vista de calendario semanal/mensual
- ❌ Tests unitarios (Jest/Vitest)
- ✅ Dockerización del proyecto
- ❌ Confirmación de citas por email (simulado)
- ✅ Búsqueda en tiempo real (debounced)
- ✅ Modo oscuro/claro











# Prueba Técnica Fullstack - Sistema de Gestión de Citas

## Descripción General

Desarrollar una aplicación fullstack para gestionar citas médicas/profesionales con detección automática de solapamientos.

## Stack Tecnológico Requerido

- **Frontend**: Vue 3 + Tailwind CSS
- **Backend**: Express.js
- **Base de Datos**: MongoDB
- **Tiempo estimado**: 2-4 horas

---

## Requisitos Funcionales

### 1. Backend (Express.js + MongoDB)

#### Modelo de Datos - Cita (Appointment)

```javascript
{
  _id: ObjectId,
  patientName: String,        // Nombre del paciente
  doctorName: String,          // Nombre del doctor/profesional
  date: Date,                  // Fecha de la cita
  startTime: String,           // Hora inicio (formato "HH:mm")
  endTime: String,             // Hora fin (formato "HH:mm")
  reason: String,              // Motivo de la cita
  status: String,              // "scheduled" | "completed" | "cancelled"
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints Requeridos

**POST /api/appointments**

- Crear nueva cita
- **Validaciones críticas**:
  - Verificar que `endTime` sea posterior a `startTime`
  - Detectar solapamiento con citas existentes del mismo doctor
  - Validar que la fecha no sea anterior a hoy
- Retornar error 409 (Conflict) si hay solapamiento con detalles de las citas conflictivas

**GET /api/appointments**

- Listar todas las citas
- **Query params opcionales**:
  - `date`: filtrar por fecha específica
  - `doctorName`: filtrar por doctor
  - `status`: filtrar por estado

**GET /api/appointments/:id**

- Obtener detalle de una cita específica

**PUT /api/appointments/:id**

- Actualizar una cita existente
- Aplicar las mismas validaciones de solapamiento (excluyendo la cita actual)

**DELETE /api/appointments/:id**

- Eliminar una cita

**GET /api/appointments/conflicts/check**

- Endpoint específico para verificar conflictos
- **Query params**:
  - `doctorName`: nombre del doctor
  - `date`: fecha (YYYY-MM-DD)
  - `startTime`: hora inicio
  - `endTime`: hora fin
  - `excludeId`: ID de cita a excluir (opcional, para ediciones)
- Retornar array de citas que generan conflicto

#### Lógica de Detección de Solapamiento

Dos citas se solapan si:

```
(nuevaInicio < existenteFin) AND (nuevaFin > existenteInicio)
```

**Casos a considerar**:

- Cita nueva dentro de una existente
- Cita nueva envuelve una existente
- Cita nueva se solapa parcialmente (inicio o fin)
- Citas consecutivas exactas NO deben considerarse solapamiento

---

### 2. Frontend (Vue 3 + Tailwind CSS)

#### Componentes Principales

**1. AppointmentList.vue**

- Mostrar tabla/lista de citas
- Filtros por fecha, doctor y estado
- Botón para crear nueva cita
- Acciones: Ver, Editar, Eliminar
- Indicador visual de estado (badges con colores)

**2. AppointmentForm.vue**

- Formulario para crear/editar citas
- Campos:
  - Nombre del paciente (input text)
  - Nombre del doctor (input text o select)
  - Fecha (date picker)
  - Hora inicio (time picker)
  - Hora fin (time picker)
  - Motivo (textarea)
  - Estado (select)
- Validación en tiempo real
- Mostrar alerta visual si hay solapamiento al intentar guardar

**3. ConflictAlert.vue**

- Componente para mostrar conflictos detectados
- Listar citas conflictivas con detalles
- Opciones: Cancelar o ver citas existentes

#### Funcionalidades Requeridas

1. **Vista principal con calendario diario** (opcional)

   - Visualización tipo timeline del día
   - Citas bloqueadas por horas

2. **Manejo de errores y feedback**

   - Feback visual para operaciones exitosas
   - Alertas claras para conflictos
   - Loading states en operaciones async

3. **Responsive design**
   - Mobile-first con Tailwind
   - Tabla debe ser scrolleable en móvil

---

## Criterios de Evaluación

### Backend

- ✅ **Lógica de solapamiento correcta**

  - Detecta todos los casos de solapamiento
  - No genera falsos positivos
  - Manejo correcto de zonas horarias/timestamps

- ✅ **API RESTful bien diseñada**

  - Endpoints semánticamente correctos
  - Códigos HTTP apropiados
  - Estructura de respuestas consistente

- ✅ **Validaciones robustas**

  - Validación de datos de entrada
  - Manejo de errores apropiado
  - Mensajes de error descriptivos

- ✅ **Código limpio y organizado**
  - Separación de responsabilidades
  - Middleware apropiados
  - Funciones reutilizables

### Frontend

- ✅ **Interfaz funcional y usable**

  - Flujo intuitivo de usuario
  - Formularios validados
  - Feedback visual apropiado

- ✅ **Integración con API**

  - Manejo correcto de estados async
  - Gestión de errores de red
  - Actualización reactiva de datos

- ✅ **Diseño y UX**

  - Uso efectivo de Tailwind
  - Componentes responsive
  - Accesibilidad básica

- ✅ **Gestión de estado**
  - Uso apropiado de Vue Composition API / Options API
  - Estado reactivo bien implementado

### Integración End-to-End

- ✅ **Funcionalidad completa**

  - CRUD completo funcional
  - Detección de conflictos
  - Sincronización frontend-backend

- ✅ **Arquitectura y estructura**

  - Organización lógica del proyecto
  - Configuración adecuada
  - Variables de entorno

---

2. **Estructura de ejemplo esperada**:

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Start boilerplate

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

## Bonus

- 🌟 Implementar paginación en el listado
- 🌟 Agregar filtros avanzados (rango de fechas)
- 🌟 Vista de calendario semanal/mensual
- 🌟 Tests unitarios (Jest/Vitest)
- 🌟 Dockerización del proyecto
- 🌟 Confirmación de citas por email (simulado)
- 🌟 Búsqueda en tiempo real (debounced)
- 🌟 Modo oscuro/claro

---

## Escenarios de ejemplo

### Escenario 1: Solapamiento Total

```
Existente: Dr. García | 10:00 - 11:00
Nueva:     Dr. García | 10:15 - 10:45
Resultado: ❌ Conflicto
```

### Escenario 2: Solapamiento Parcial (Inicio)

```
Existente: Dr. García | 10:00 - 11:00
Nueva:     Dr. García | 09:30 - 10:30
Resultado: ❌ Conflicto
```

### Escenario 3: Solapamiento Parcial (Fin)

```
Existente: Dr. García | 10:00 - 11:00
Nueva:     Dr. García | 10:30 - 11:30
Resultado: ❌ Conflicto
```

### Escenario 4: Citas Consecutivas

```
Existente: Dr. García | 10:00 - 11:00
Nueva:     Dr. García | 11:00 - 12:00
Resultado: ✅ Sin conflicto
```

### Escenario 5: Mismo Horario, Diferente Doctor

```
Existente: Dr. García | 10:00 - 11:00
Nueva:     Dr. López  | 10:00 - 11:00
Resultado: ✅ Sin conflicto
```

### Escenario 6: Cita Envolvente

```
Existente: Dr. García | 10:00 - 11:00
Nueva:     Dr. García | 09:00 - 12:00
Resultado: ❌ Conflicto
```

---

## Notas Finales

- No se requiere autenticación/autorización
- Puedes usar librerías adicionales si lo consideras necesario (moment.js, date-fns, etc.)
- El foco está en la lógica de negocio y la integración end-to-end
- Código limpio y legible es más importante que features adicionales
- Documenta cualquier limitación o supuesto que hayas asumido
