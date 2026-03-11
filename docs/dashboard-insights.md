# Dashboard Insights - Saverah

Este documento lista todos los datos que se muestran en el panel de control (dashboard) de Saverah.

## Resumen de datos mostrados

### 1. Encabezado

- **Título**: "Panel de control"
- **Subtítulo**: "Resumen de tus finanzas personales"

### 2. Estadísticas principales (DashboardStats)

- **Balance actual** - Diferencia entre ingresos y gastos
- **Ingresos totales** - Suma de todos los ingresos del período
- **Gastos totales** - Suma de todos los gastos del período

### 3. Estadísticas rápidas (QuickStatsRow)

- Datos del presupuesto (budget) mostrados en tarjetas compactas

### 4. Pagos urgentes (UrgentAlerts)

- **Cantidad de pagos urgentes** - Recordatorios con fecha de vencimiento próxima (3 días o menos)
- **Lista de recordatorios urgentes** - Detalles de cada pago que vence pronto
- Enlace: "Ver todos" → `/reminders`

### 5. Alertas de presupuesto (BudgetAlerts)

- **Cantidad de categorías con alerta** - Categorías que han alcanzado el 80% o más de su límite
- **Estado por categoría**:
  - Nombre de la categoría
  - Porcentaje del límite consumido
  - Monto gastado vs. límite mensual
- Enlace: "Ver presupuesto" → `/budget`

### 6. Tarjetas de crédito (CreditCardsQuickView)

- Vista rápida de tarjetas de crédito
- Datos de cada tarjeta (cargado de forma asíncrona)

### 7. Resumen mensual (MonthlyOverview)

- **Presupuesto actual** (currentBudget):
  - Desglose por categorías
  - Comparación ingresos vs. gastos
  - Tendencias mensuales
- Cargado de forma asíncrona

### 8. Actividad reciente (RecentActivity)

- **Últimas transacciones** registradas
- Movimientos recientes de ingresos y gastos
- Enlace: "Ver todo" → `/budget`
- Cargado de forma asíncrona

### 9. Meta de ahorro (SavingsGoals)

- **Progreso hacia metas de ahorro**
- Basado en el presupuesto actual (budget)

### 10. Racha de presupuesto (BudgetStreak)

- **Días consecutivos** cumpliendo el presupuesto
- **Racha actual** de buenos hábitos financieros

### 11. Logros (Achievements)

- **Insignias y reconocimientos** desbloqueados
- **Progreso** hacia nuevos logros
- Hitos financieros alcanzados

## Datos calculados en el servidor

El dashboard realiza los siguientes cálculos en el servidor:

### Recordatorios activos

```
activeReminders = reminders.filter((r) => r.is_active)
```

### Conteo de pagos urgentes

```
urgentCount = activeReminders.filter((r) => {
  const today = new Date().getDate()
  const diff = Math.abs(r.due_day - today)
  return diff <= 3 || (r.due_day >= 28 && today <= 3)
}).length
```

### Conteo de alertas de presupuesto

```
alertCount = budget.categories.filter(
  (cat) => cat.limit && (cat.percentage || 0) >= 80
).length
```

## Fuentes de datos

Los datos provienen de dos endpoints principales:

1. **Reminders API** (`getReminders(user.id)`)
   - Tabla: `reminders`
   - Campos: id, name, amount, due_day, recurrence, category, is_active, etc.

2. **Budget API** (`getBudgetSummary(user.id)`)
   - Tablas: `income`, `expenses`, `budget_limits`
   - Campos: total_income, total_expenses, balance, categories[], etc.

## Componentes que cargan datos asíncronos

Los siguientes componentes utilizan `Suspense` para cargar datos de forma asíncrona:

- `UrgentAlerts` - Carga recordatorios urgentes
- `CreditCardsQuickView` - Carga datos de tarjetas de crédito
- `MonthlyOverview` - Carga resumen mensual detallado
- `RecentActivity` - Carga actividad reciente

## Componentes con datos síncronos

Los siguientes componentes reciben datos directamente del servidor:

- `DashboardStats` - Balance, ingresos y gastos totales
- `QuickStatsRow` - Estadísticas rápidas del presupuesto
- `BudgetAlerts` - Alertas de presupuesto por categoría
- `SavingsGoals` - Metas de ahorro
- `BudgetStreak` - Racha de presupuesto
- `Achievements` - Logros desbloqueados

---

## Elementos más importantes para el usuario (Top 5)

Basado en la prioridad de información financiera crítica, estos son los elementos más importantes del dashboard:

### 1. DashboardStats (Estadísticas principales)

**Prioridad: Alta**

- **Balance actual**: La métrica más importante - indica la salud financiera general
- **Ingresos totales**: Muestra la capacidad de generar ingresos
- **Gastos totales**: Permite evaluar el nivel de consumo
- **Por qué importa**: Es la visión de 10,000 pies de las finanzas personales. Sin conocer el balance, no se puede tomar decisiones informadas.

### 2. QuickStatsRow (Estadísticas rápidas)

**Prioridad: Alta**

- Datos compactos del presupuesto en formato visual rápido
- **Por qué importa**: Proporciona métricas clave de un vistazo sin tener que navegar a otras páginas

### 3. UrgentAlerts (Pagos urgentes)

**Prioridad: Crítica**

- Recordatorios de pagos que vencen en 3 días o menos
- Badge con contador de alertas
- **Por qué importa**: Evita pagos tardíos, cargos por mora, y daños al historial crediticio. Acción inmediata requerida.

### 4. BudgetAlerts (Alertas de presupuesto)

**Prioridad: Alta**

- Categorías que han alcanzado el 80% o más de su límite
- Estado por categoría con porcentajes
- **Por qué importa**: Permite ajustar el gasto antes de exceder límites. Previene sobregiros y mantiene el control financiero mensual.

### 5. RecentActivity (Actividad reciente)

**Prioridad: Media-Alta**

- Últimas transacciones registradas
- Movimientos recientes de ingresos y gastos
- **Por qué importa**: Ayuda a detectar gastos inesperados, verificar que los ingresos se registraron correctamente, y mantenerse al día con los movimientos financieros.

### Resumen de prioridades

| #   | Elemento       | Prioridad  | Razón principal            |
| --- | -------------- | ---------- | -------------------------- |
| 1   | DashboardStats | Alta       | Visión general financiera  |
| 2   | QuickStatsRow  | Alta       | Métricas rápidas           |
| 3   | UrgentAlerts   | Crítica    | Acción inmediata requerida |
| 4   | BudgetAlerts   | Alta       | Control de gastos          |
| 5   | RecentActivity | Media-Alta | Seguimiento de movimientos |
