# Plan de Implementación: Dashboard Mejorado

## Resumen Ejecutivo

Este documento detalla la implementación técnica para transformar el dashboard actual de Saverah en una experiencia rica, informativa y motivadora. El plan se divide en 4 fases, implementando funcionalidades desde esenciales hasta avanzadas.

**Fecha de inicio:** Marzo 2026  
**Estimación total:** 2-3 semanas  
**Prioridad:** Alta  
**Actualización:** Persistencia en base de datos para configuraciones del usuario

---

## Arquitectura General

### Principios de Diseño

1. **Server-First con Client Islands**: Las secciones serán Server Components que renderizan datos, con Client Components para interactividad (toggle expand/collapse, botones de acción rápida).

2. **Collapsible Sections**: Todas las secciones principales serán colapsables usando el componente `CollapsibleSection` compartido.

3. **Lazy Loading**: Las secciones de baja prioridad se cargarán con `<Suspense>` para mejorar el Time to First Byte (TTFB).

4. **Database Persistence**: Toda la configuración del dashboard (metas de ahorro, logros, estado de secciones) se persiste en la base de datos PostgreSQL con RLS para seguridad.

5. **Mobile-First**: El diseño debe funcionar perfectamente en móviles con cards apiladas verticalmente.

---

## Esquema de Base de Datos

### Tablas Nuevas Requeridas

#### 1. `user_dashboard_settings`

Almacena el estado colapsado/expandido de las secciones del dashboard por usuario.

```sql
CREATE TABLE user_dashboard_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Estado de cada sección (true = expandida, false = colapsada)
  quick_stats_expanded boolean DEFAULT true,
  urgent_alerts_expanded boolean DEFAULT true,
  budget_alerts_expanded boolean DEFAULT true,
  monthly_overview_expanded boolean DEFAULT true,
  recent_activity_expanded boolean DEFAULT true,
  savings_goals_expanded boolean DEFAULT true,
  budget_streak_expanded boolean DEFAULT true,
  achievements_expanded boolean DEFAULT true,
  credit_cards_expanded boolean DEFAULT true,

  -- Configuración general
  stats_visibility boolean DEFAULT true, -- Para el toggle de visibilidad de números

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id)
);

-- RLS Policy: Users can only see/modify their own settings
ALTER TABLE user_dashboard_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their dashboard settings"
  ON user_dashboard_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_dashboard_settings_updated_at
  BEFORE UPDATE ON user_dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. `savings_goals`

Almacena las metas de ahorro configuradas por el usuario.

```sql
CREATE TABLE savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Tipo de meta
  goal_type text NOT NULL CHECK (goal_type IN ('fixed', 'percentage')),

  -- Valores objetivo
  target_amount numeric(12, 2),
  target_percentage numeric(5, 2),

  -- Periodo (mensual por defecto)
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,

  -- Estado
  is_active boolean DEFAULT true,
  completed_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, month, year)
);

-- Index para búsquedas rápidas
CREATE INDEX idx_savings_goals_user_month_year
  ON savings_goals(user_id, year DESC, month DESC);

-- RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their savings goals"
  ON savings_goals
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 3. `achievements`

Define todos los logros disponibles en el sistema (datos maestros).

```sql
CREATE TABLE achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  condition_type text NOT NULL CHECK (condition_type IN (
    'first_expense',
    'savings_rate',
    'streak_days',
    'unique_categories',
    'total_payments',
    'budget_adherence'
  )),
  condition_value numeric(10, 2),
  points integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed data (logros iniciales)
INSERT INTO achievements (id, title, description, icon, condition_type, condition_value, points) VALUES
  ('first_expense', 'Primer Paso', 'Registra tu primer gasto', '🌱', 'first_expense', 1, 5),
  ('savings_master', 'Maestro del Ahorro', 'Ahorra 20% de tus ingresos en un mes', '🥇', 'savings_rate', 20, 25),
  ('savings_champion', 'Campeón del Ahorro', 'Ahorra 30% de tus ingresos en un mes', '🏆', 'savings_rate', 30, 50),
  ('streak_7', 'Semana Perfecta', '7 días sin exceder presupuesto', '🔥', 'streak_days', 7, 15),
  ('streak_14', 'Dos Semanas', '14 días sin exceder presupuesto', '🔥🔥', 'streak_days', 14, 30),
  ('streak_30', 'Maestro del Control', '30 días sin exceder presupuesto', '👑', 'streak_days', 30, 100),
  ('organized', 'Organizado', 'Usa 5 categorías diferentes', '📊', 'unique_categories', 5, 10),
  ('super_organized', 'Super Organizado', 'Usa 10 categorías diferentes', '📊📊', 'unique_categories', 10, 25),
  ('regular_payer', 'Pagador Regular', 'Realiza 10 pagos de recordatorios', '💳', 'total_payments', 10, 15),
  ('consistent_saver', 'Ahorrador Consistente', '3 meses consecutivos con ahorro positivo', '💰', 'budget_adherence', 3, 50);
```

#### 4. `user_achievements`

Relación entre usuarios y logros desbloqueados.

```sql
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,

  -- Fecha de desbloqueo
  unlocked_at timestamptz DEFAULT now(),

  -- Datos adicionales (JSONB flexible)
  metadata jsonb DEFAULT '{}',

  -- Visto por el usuario (para badge "Nuevo")
  is_viewed boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, achievement_id)
);

-- Index para búsquedas
CREATE INDEX idx_user_achievements_user_id
  ON user_achievements(user_id, unlocked_at DESC);

-- RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their achievements"
  ON user_achievements
  FOR ALL
  USING (auth.uid() = user_id);
```

#### 5. `budget_streak_history`

Historial diario de cumplimiento de presupuesto para calcular rachas.

```sql
CREATE TABLE budget_streak_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Fecha del registro
  record_date date NOT NULL,

  -- ¿Todas las categorías estuvieron dentro del límite ese día?
  all_categories_within_limit boolean NOT NULL,

  -- Categorías que excedieron el límite (si aplica)
  exceeded_categories text[] DEFAULT '{}',

  -- Total gastado ese día
  daily_total numeric(12, 2),

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, record_date)
);

-- Index para cálculo de rachas
CREATE INDEX idx_streak_history_user_date
  ON budget_streak_history(user_id, record_date DESC);

-- RLS
ALTER TABLE budget_streak_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their streak history"
  ON budget_streak_history
  FOR ALL
  USING (auth.uid() = user_id);
```

#### 6. `estimated_reminder_amounts`

Monto estimado de pago para cada reminder (para calcular "Total vencimientos este mes").

```sql
CREATE TABLE estimated_reminder_amounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_id uuid REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,

  -- Monto estimado basado en promedio o último pago
  estimated_amount numeric(12, 2) NOT NULL,

  -- Tipo de estimación
  calculation_method text NOT NULL CHECK (calculation_method IN ('average', 'last_payment', 'manual')),

  -- Fecha del cálculo
  calculated_at timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, reminder_id)
);

-- RLS
ALTER TABLE estimated_reminder_amounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their estimated amounts"
  ON estimated_reminder_amounts
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_estimated_amounts_updated_at
  BEFORE UPDATE ON estimated_reminder_amounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## FASE 1: Funcionalidades Esenciales (Días 1-5)

### 1.1 Setup de Base de Datos y API

**Archivos:**

- `supabase/migrations/004_dashboard_tables.sql` - Todas las tablas anteriores
- `src/lib/api/dashboardSettings.ts` - Funciones para CRUD de settings
- `src/lib/api/savingsGoals.ts` - CRUD de metas de ahorro
- `src/lib/api/achievements.ts` - Lógica de desbloqueo de logros
- `src/lib/api/streakHistory.ts` - Registro diario de rachas

**API Functions:**

```typescript
// Dashboard Settings
export async function getDashboardSettings(
  userId: string,
): Promise<DashboardSettings>;
export async function updateDashboardSettings(
  userId: string,
  settings: Partial<DashboardSettings>,
): Promise<void>;
export async function toggleSectionVisibility(
  userId: string,
  sectionId: string,
  isExpanded: boolean,
): Promise<void>;

// Savings Goals
export async function getCurrentSavingsGoal(
  userId: string,
): Promise<SavingsGoal | null>;
export async function createSavingsGoal(
  userId: string,
  goal: CreateSavingsGoalInput,
): Promise<SavingsGoal>;
export async function updateSavingsGoal(
  userId: string,
  goalId: string,
  updates: Partial<SavingsGoal>,
): Promise<SavingsGoal>;

// Achievements
export async function getUserAchievements(
  userId: string,
): Promise<UserAchievement[]>;
export async function checkAndUnlockAchievements(
  userId: string,
): Promise<Achievement[]>;
export async function markAchievementAsViewed(
  userId: string,
  achievementId: string,
): Promise<void>;

// Streak
export async function getCurrentStreak(userId: string): Promise<number>;
export async function recordDailyBudgetStatus(
  userId: string,
  date: string,
  withinLimit: boolean,
  exceededCategories?: string[],
): Promise<void>;

// Estimated Amounts
export async function getEstimatedReminderAmounts(
  userId: string,
): Promise<EstimatedReminderAmount[]>;
export async function updateEstimatedAmount(
  userId: string,
  reminderId: string,
  amount: number,
  method: 'average' | 'last_payment' | 'manual',
): Promise<void>;
```

**Estimación:** 8-10 horas

---

### 1.2 Componente Base: CollapsibleSection

**Archivo:** `src/components/dashboard/CollapsibleSection.tsx` (Client Component)

**Props Interface:**

```typescript
interface CollapsibleSectionProps {
  sectionId: string; // ID único (ej: 'quick-stats', 'urgent-alerts')
  title: string;
  icon: React.ReactNode;
  badge?: string | number;
  defaultExpanded?: boolean;
  priority?: 'high' | 'medium' | 'low';
  children: React.ReactNode;
  action?: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  // Nuevo: Callback para persistir en DB
  onToggle?: (isExpanded: boolean) => Promise<void>;
}

// Hook para manejar estado
function useDashboardSection(sectionId: string) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar estado inicial del servidor
  useEffect(() => {
    api.get(`/dashboard/settings`).then((res) => {
      const sectionKey = `${sectionId}_expanded`;
      setIsExpanded(res.data[sectionKey] ?? true);
    });
  }, [sectionId]);

  const toggle = async () => {
    setIsLoading(true);
    const newState = !isExpanded;

    // Optimistic update
    setIsExpanded(newState);

    // Persistir en DB
    try {
      await api.patch('/dashboard/settings', {
        [`${sectionId}_expanded`]: newState,
      });
    } catch (error) {
      // Rollback en caso de error
      setIsExpanded(!newState);
      console.error('Error saving section state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isExpanded, isLoading, toggle };
}
```

**Features:**

- Client Component con `useState` para controlar expand/collapse
- Persistencia inmediata en BD via API (no localStorage)
- Animación CSS suave al expandir/colapsar
- Optimistic UI para respuesta instantánea
- Badge opcional con número de alertas/elementos
- Header sticky opcional

**Estimación:** 4-5 horas

---

### 1.3 Quick Stats Row

**Archivo:** `src/components/dashboard/QuickStatsRow.tsx` (Client Component)

**Cálculos:**

```typescript
// Usando estimated_amount de reminders
const calculateTotalDue = async (userId: string): Promise<number> => {
  const amounts = await getEstimatedReminderAmounts(userId);
  return amounts.reduce((sum, a) => sum + a.estimated_amount, 0);
};

// Daily Budget (remaining budget / remaining days)
const calculateDailyBudget = (budget: BudgetSummary): number => {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const remainingDays = lastDayOfMonth.getDate() - today.getDate() + 1;

  return remainingDays > 0 ? budget.balance / remainingDays : 0;
};

// Savings progress usando BD
const getSavingsProgress = async (userId: string, budget: BudgetSummary) => {
  const goal = await getCurrentSavingsGoal(userId);
  if (!goal) return null;

  if (goal.goal_type === 'fixed' && goal.target_amount) {
    const saved = Math.max(0, budget.balance);
    return {
      percentage: Math.min(100, (saved / goal.target_amount) * 100),
      remaining: Math.max(0, goal.target_amount - saved),
      target: goal.target_amount,
    };
  }

  if (goal.goal_type === 'percentage' && goal.target_percentage) {
    const target = (budget.total_income * goal.target_percentage) / 100;
    const saved = Math.max(0, budget.balance);
    return {
      percentage: Math.min(100, (saved / target) * 100),
      remaining: Math.max(0, target - saved),
      target,
    };
  }
};

// Streak desde BD
const getStreak = async (userId: string): Promise<number> => {
  return await getCurrentStreak(userId);
};
```

**UI:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 💰 Puedes gastar hoy: $XXX           📊 Meta mensual: XX% completada    │
│ 💳 Total vencimientos: $XXX          🔥 Racha: XX días sin exceder        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Interacción:**

- Click en "Meta mensual" abre modal para configurar/editar meta
- Cada cálculo se refresca automáticamente cuando cambian los datos

**Estimación:** 6-8 horas

---

### 1.4 Urgent Alerts Section

**Archivo:** `src/components/dashboard/UrgentAlerts.tsx` (Server Component)

**Lógica:**

```typescript
// Server-side filtering
const urgentReminders = reminders
  .filter((r) => r.is_active)
  .map((r) => ({
    ...r,
    daysUntilDue: getDaysUntilDue(r.due_day, r.recurrence),
    // Agregar monto estimado si existe
    estimatedAmount: estimatedAmounts.find((a) => a.reminder_id === r.id)
      ?.estimated_amount,
  }))
  .filter((r) => r.daysUntilDue <= 3)
  .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
```

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🚨 URGENTE - Próximos 3 días                                    │
│                                                                 │
│ 🔴 Tarjeta Visa ($1,200)  Vence mañana!          [Ver]  [Pagar] │
│ 🟡 Luz CFE ($450)         En 2 días              [Ver]         │
│ 🟡 Netflix ($89)          En 3 días              [Ver]         │
│                                                                 │
│ [Ver todos los recordatorios →]                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Estimación:** 4-5 horas

---

### 1.5 Category Overspending Alerts

**Archivo:** `src/components/dashboard/BudgetAlerts.tsx` (Server Component)

**Filtros:**

- Categorías con `percentage >= 80%`
- Máximo 5 mostradas
- Ordenadas por percentage descendente

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Alertas de presupuesto                                       │
│                                                                 │
│ 🍽️ Alimentación        95%        ¡Cuidado!                    │
│    $4,750 / $5,000        [███████░░░]                          │
│                                                                 │
│ 🚗 Transporte          110%       ¡Excedido! +$200              │
│    $2,200 / $2,000        [██████████]                          │
└─────────────────────────────────────────────────────────────────┘
```

**Estimación:** 4-5 horas

---

## FASE 2: Seguimiento Mensual y Actividad (Días 6-10)

### 2.1 Monthly Overview

**Archivo:** `src/components/dashboard/MonthlyOverview.tsx` (Server Component)

**Datos:**

- Mes actual: disponible en `budget`
- Mes anterior: nuevo endpoint `/api/dashboard/last-month-summary`

**Endpoint:**

```typescript
// GET /api/dashboard/last-month-summary
export async function getLastMonthSummary(userId: string) {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Query income y expenses del mes anterior
  // Retornar BudgetSummary para ese periodo
}
```

**Cálculos:**

```typescript
const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) return null;
  const diff = ((current - previous) / previous) * 100;
  return {
    direction: diff > 0 ? 'up' : 'down',
    percentage: Math.abs(diff),
    isPositive: diff > 0, // Para ingresos: up es bueno. Para gastos: down es bueno
  };
};

// Mensajes motivacionales
const getMotivationalMessage = (
  type: 'income' | 'expenses' | 'balance',
  trend: Trend,
) => {
  if (type === 'income') {
    return trend.direction === 'up'
      ? trend.percentage > 10
        ? '¡Excelente!'
        : 'Bien hecho'
      : 'Intenta aumentar tus ingresos';
  }
  if (type === 'expenses') {
    return trend.direction === 'down'
      ? '¡Buen control de gastos!'
      : 'Intenta reducir gastos este mes';
  }
  return trend.direction === 'up'
    ? '¡Estás ahorrando más!'
    : 'Este mes fue difícil, ¡ánimo para el próximo!';
};
```

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 📅 Febrero 2024 vs Enero 2024                                   │
│                                                                 │
│ Ingresos:    $20,000    ↑ 5%    🟢 Bien hecho                   │
│ Gastos:      $15,000    ↓ 3%    🟢 Buen control                 │
│ Balance:     $5,000     ↑ 15%   🟢 ¡Excelente!                  │
│                                                                 │
│ 💡 Has ahorrado $800 más que el mes pasado                     │
└─────────────────────────────────────────────────────────────────┘
```

**Estimación:** 5-6 horas

---

### 2.2 Recent Activity

**Archivo:** `src/components/dashboard/RecentActivity.tsx` (Server Component)

**Endpoint:**

```typescript
// GET /api/dashboard/recent-activity?limit=5
interface ActivityItem {
  id: string;
  type: 'income' | 'expense' | 'payment';
  description: string;
  amount: number;
  date: string;
  category?: string;
}

export async function getRecentActivity(
  userId: string,
  limit = 5,
): Promise<ActivityItem[]> {
  const [income, expenses, payments] = await Promise.all([
    // Últimos ingresos
    supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('received_at', { ascending: false })
      .limit(limit),

    // Últimos gastos
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('spent_at', { ascending: false })
      .limit(limit),

    // Últimos pagos de reminders
    supabase
      .from('reminder_payments')
      .select('*, reminders(name)')
      .eq('user_id', userId)
      .order('paid_at', { ascending: false })
      .limit(limit),
  ]);

  // Normalizar y combinar
  const activities: ActivityItem[] = [
    ...(income.data || []).map((i) => ({
      id: i.id,
      type: 'income' as const,
      description: i.source,
      amount: i.amount,
      date: i.received_at,
      category: 'Ingreso',
    })),
    ...(expenses.data || []).map((e) => ({
      id: e.id,
      type: 'expense' as const,
      description: e.description,
      amount: e.amount,
      date: e.spent_at,
      category: e.category,
    })),
    ...(payments.data || []).map((p) => ({
      id: p.id,
      type: 'payment' as const,
      description: `Pago: ${p.reminders?.name || 'Recordatorio'}`,
      amount: p.amount_paid,
      date: p.paid_at,
      category: 'Pago',
    })),
  ];

  // Ordenar por fecha y limitar
  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
```

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 Actividad reciente                                           │
│                                                                 │
│ 💵 +$8,500    Salario              Hoy, 9:00 AM               │
│ 💸 -$450      Supermercado         Ayer, 6:30 PM               │
│ 💳 -$1,200    Tarjeta Visa         Ayer, 2:00 PM               │
│ 📺 -$89       Netflix              12 Feb, 8:00 AM            │
│                                                                 │
│ [Ver todo →]                    [+ Registrar gasto]           │
└─────────────────────────────────────────────────────────────────┘
```

**Estimación:** 5-6 horas

---

## FASE 3: Metas de Ahorro y Logros (Días 11-15)

### 3.1 Savings Goals Module

**Archivo:** `src/components/dashboard/SavingsGoals.tsx` (Client Component)

**Features:**

- Mostrar meta actual del mes (desde BD)
- Barra de progreso visual
- Modal para crear/editar meta
- Persistencia automática en BD

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Tu meta de ahorro - Febrero 2024                             │
│                                                                 │
│ [✏️ Editar meta]                                                │
│                                                                 │
│ Meta: Ahorrar $5,000 este mes                                   │
│ [████████████░░░░░░░░] 60%                                      │
│                                                                 │
│ Progreso: $3,000 / $5,000                                      │
│ Te falta: $2,000                                               │
│                                                                 │
│ 💡 Si mantienes este ritmo, llegarás el 25 de febrero          │
└─────────────────────────────────────────────────────────────────┘
```

**Modal de Configuración:**

```
┌────────────────────────────────────────────┐
│ Configurar meta de ahorro                  │
│                                            │
│ ○ Ahorrar $________ este mes               │
│   [Radio button]                           │
│                                            │
│ ○ Ahorrar ___% de mis ingresos             │
│   [Radio button]                           │
│                                            │
│ [Cancelar]        [💾 Guardar meta]       │
└────────────────────────────────────────────┘
```

**Estimación:** 6-8 horas

---

### 3.2 Budget Streak

**Archivo:** `src/components/dashboard/BudgetStreak.tsx` (Server Component)

**Lógica:**

```typescript
// Calcular racha actual desde BD
const calculateStreak = async (userId: string): Promise<number> => {
  const history = await supabase
    .from('budget_streak_history')
    .select('*')
    .eq('user_id', userId)
    .eq('all_categories_within_limit', true)
    .order('record_date', { ascending: false });

  if (!history.data?.length) return 0;

  // Contar días consecutivos desde hoy hacia atrás
  let streak = 0;
  const today = new Date();

  for (const record of history.data) {
    const recordDate = new Date(record.record_date);
    const diffDays = Math.floor(
      (today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
```

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔥 Racha de control presupuestario                              │
│                                                                 │
│                    🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥                        │
│                                                                 │
│              12 días sin exceder presupuesto                    │
│                                                                 │
│ "¡Vas por buen camino! Mantén el control."                     │
│                                                                 │
│ Próximo logro: 15 días (Maestro del Control)                   │
└─────────────────────────────────────────────────────────────────┘
```

**Mensajes por racha:**

- 1-6 días: "🔥 Racha de X días - ¡Sigue así!"
- 7-13 días: "🔥🔥 Semana completa - ¡Increíble!"
- 14-29 días: "🔥🔥🔥 ¡Dos semanas! Eres imparable"
- 30+ días: "🏆 ¡Un mes entero! Eres un maestro del presupuesto"

**Estimación:** 6-7 horas

---

### 3.3 Achievements System

**Archivo:** `src/components/dashboard/Achievements.tsx` (Client Component)

**Lógica de Desbloqueo:**

```typescript
// Verificar logros al cargar dashboard
const checkAchievements = async (userId: string, stats: UserStats) => {
  const unlocked: string[] = [];

  // 1. Primer gasto
  if (stats.totalExpenses >= 1) {
    unlocked.push('first_expense');
  }

  // 2. Maestro del ahorro (20%)
  if (stats.balance > 0 && stats.balance / stats.income >= 0.2) {
    unlocked.push('savings_master');
  }

  // 3. Campeón del ahorro (30%)
  if (stats.balance > 0 && stats.balance / stats.income >= 0.3) {
    unlocked.push('savings_champion');
  }

  // 4. Racha de 7 días
  if (stats.streak >= 7) {
    unlocked.push('streak_7');
  }

  // 5. Racha de 14 días
  if (stats.streak >= 14) {
    unlocked.push('streak_14');
  }

  // 6. Racha de 30 días
  if (stats.streak >= 30) {
    unlocked.push('streak_30');
  }

  // 7. 5 categorías
  if (stats.uniqueCategories >= 5) {
    unlocked.push('organized');
  }

  // 8. 10 categorías
  if (stats.uniqueCategories >= 10) {
    unlocked.push('super_organized');
  }

  // 9. 10 pagos
  if (stats.totalPayments >= 10) {
    unlocked.push('regular_payer');
  }

  // Guardar logros nuevos
  for (const achievementId of unlocked) {
    await unlockAchievement(userId, achievementId);
  }

  return unlocked;
};
```

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏆 Tus logros                                                   │
│                                                                 │
│ 🥇 Maestro del Ahorro                      [Nuevo] 🎉           │
│    Desbloqueado: 15 de febrero de 2024                          │
│    ¡Ahorraste 25% de tus ingresos este mes!                     │
│                                                                 │
│ 🔥 Semana Perfecta                                               │
│    Desbloqueado: 8 de febrero de 2024                           │
│    7 días sin exceder presupuesto                               │
│                                                                 │
│ ⭐ Próximos logros:                                              │
│    📊 Organizado     Usa 3 categorías más (2/5)                │
│    👑 Maestro del Control   18 días más de racha (12/30)      │
└─────────────────────────────────────────────────────────────────┘
```

**Estimación:** 8-10 horas

---

## FASE 4: Tarjetas de Crédito (Días 16-18)

### 4.1 Credit Card Quick View

**Archivo:** `src/components/dashboard/CreditCardView.tsx` (Server Component)

**Condición:** Solo renderizar si el usuario tiene reminders de tipo "Tarjeta de Crédito" activos.

**Datos:**

```typescript
interface CreditCardDisplay {
  id: string;
  name: string;
  cutoffDay: number;
  dueDay: number;
  daysUntilCutoff: number;
  daysUntilDue: number;
  isCutoffSoon: boolean;
  isDueSoon: boolean;
  estimatedPayment: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

// Obtener datos
const getCreditCardsData = async (
  userId: string,
): Promise<CreditCardDisplay[]> => {
  const reminders = await getReminders(userId);
  const creditCards = reminders.filter(
    (r) => r.category === 'Tarjeta de Crédito' && r.is_active,
  );

  return creditCards.map((card) => {
    const daysUntilCutoff = getDaysUntilCutoff(card.cutoff_day!);
    const daysUntilDue = getDaysUntilDue(card.due_day, card.recurrence);
    const estimatedAmount = getEstimatedAmount(userId, card.id);

    return {
      id: card.id,
      name: card.name,
      cutoffDay: card.cutoff_day!,
      dueDay: card.due_day,
      daysUntilCutoff,
      daysUntilDue,
      isCutoffSoon: daysUntilCutoff <= 3,
      isDueSoon: daysUntilDue <= 3,
      estimatedPayment: estimatedAmount,
    };
  });
};
```

**UI:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 💳 Tarjetas de crédito                                          │
│                                                                 │
│ Visa                                                            │
│    ⏰ Corte: En 5 días (25 Feb)                                │
│    💰 Pago estimado: $1,200                                    │
│    📅 Vence: En 19 días (15 Mar)                               │
│    [Marcar como pagada]                                         │
│                                                                 │
│ Mastercard                                                      │
│    ⏰ Corte: ¡Hoy! ⚠️                                          │
│    💰 Pago estimado: $850                                      │
│    📅 Vence: En 15 días (25 Feb)                               │
│    [Marcar como pagada]                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Estimación:** 4-5 horas

---

## Componentes Compartidos

### DashboardSection Wrapper

**Archivo:** `src/components/dashboard/DashboardSection.tsx`

**Características:**

- Header con icono, título y badge
- Botón expand/collapse con persistencia en BD
- Animación CSS suave
- Acción opcional (ej: "Ver todos →")
- Prioridad para lazy loading

**Estimación:** 4 horas

---

## API Endpoints

### Nuevos Endpoints:

1. **GET /api/dashboard/settings**
   - Retorna configuración del dashboard del usuario

2. **PATCH /api/dashboard/settings**
   - Actualiza configuración (expand/collapse de secciones)

3. **GET /api/dashboard/savings-goal**
   - Retorna meta de ahorro actual

4. **POST /api/dashboard/savings-goal**
   - Crea nueva meta de ahorro

5. **PATCH /api/dashboard/savings-goal/:id**
   - Actualiza meta existente

6. **GET /api/dashboard/achievements**
   - Retorna logros del usuario con estado de desbloqueo

7. **POST /api/dashboard/achievements/:id/view**
   - Marca logro como visto (quita badge "Nuevo")

8. **GET /api/dashboard/streak**
   - Retorna racha actual

9. **GET /api/dashboard/recent-activity**
   - Retorna actividad reciente combinada

10. **GET /api/dashboard/last-month-summary**
    - Retorna resumen del mes anterior

11. **GET /api/dashboard/estimated-amounts**
    - Retorna montos estimados de reminders

12. **PATCH /api/dashboard/estimated-amounts/:reminderId**
    - Actualiza monto estimado de un reminder

---

## Estructura de Archivos

```
src/
├── app/(app)/dashboard/
│   └── page.tsx                    # Dashboard principal
│
├── app/api/dashboard/
│   ├── settings/route.ts           # GET, PATCH settings
│   ├── savings-goal/route.ts       # GET, POST savings goal
│   ├── achievements/route.ts     # GET achievements
│   ├── streak/route.ts             # GET streak
│   ├── recent-activity/route.ts    # GET activity
│   ├── last-month/route.ts         # GET last month summary
│   └── estimated-amounts/route.ts  # GET, PATCH estimated amounts
│
├── components/dashboard/
│   ├── DashboardSection.tsx        # Wrapper colapsible
│   ├── DashboardStats.tsx          # Stats con toggle visibility
│   ├── QuickStatsRow.tsx           # Fila de stats rápidos
│   ├── UrgentAlerts.tsx            # Alertas urgentes
│   ├── BudgetAlerts.tsx            # Alertas de presupuesto
│   ├── MonthlyOverview.tsx         # Comparativa mensual
│   ├── RecentActivity.tsx          # Actividad reciente
│   ├── SavingsGoals.tsx            # Metas de ahorro
│   ├── BudgetStreak.tsx            # Contador de racha
│   ├── Achievements.tsx              # Sistema de logros
│   └── CreditCardView.tsx          # Vista rápida tarjetas
│
├── lib/api/
│   ├── dashboardSettings.ts        # CRUD settings
│   ├── savingsGoals.ts             # CRUD metas
│   ├── achievements.ts             # Lógica logros
│   ├── streakHistory.ts            # CRUD rachas
│   └── estimatedAmounts.ts         # CRUD montos estimados
│
├── types/
│   └── dashboard.types.ts          # Tipos TypeScript
│
supabase/
└── migrations/
    └── 004_dashboard_tables.sql    # Todas las tablas nuevas
```

---

## Estimaciones Actualizadas

| Componente/Funcionalidad | Estimación | Buffer | Total          |
| ------------------------ | ---------- | ------ | -------------- |
| **Base de Datos + APIs** | 8-10h      | +2h    | 10-12h         |
| **CollapsibleSection**   | 4-5h       | +1h    | 5-6h           |
| **Quick Stats Row**      | 6-8h       | +2h    | 8-10h          |
| **Urgent Alerts**        | 4-5h       | +1h    | 5-6h           |
| **Budget Alerts**        | 4-5h       | +1h    | 5-6h           |
| **Monthly Overview**     | 5-6h       | +1h    | 6-7h           |
| **Recent Activity**      | 5-6h       | +1h    | 6-7h           |
| **Savings Goals**        | 6-8h       | +2h    | 8-10h          |
| **Budget Streak**        | 6-7h       | +1h    | 7-8h           |
| **Achievements**         | 8-10h      | +2h    | 10-12h         |
| **Credit Card View**     | 4-5h       | +1h    | 5-6h           |
| **Testing & Polishing**  | 8-10h      | -      | 8-10h          |
| **TOTAL**                | **72-88h** |        | **~3 semanas** |

---

## Testing Checklist

- [ ] Todas las tablas tienen RLS habilitado
- [ ] Expand/collapse persiste en BD y sobrevive refresh
- [ ] Meta de ahorro se guarda y recupera correctamente
- [ ] Logros se desbloquean automáticamente
- [ ] Badge "Nuevo" aparece en logros recientes
- [ ] Racha se calcula correctamente desde BD
- [ ] Montos estimados se actualizan correctamente
- [ ] Daily budget calcula (remaining / remaining days)
- [ ] Urgent alerts filtran < 3 días
- [ ] Budget alerts filtran >= 80%
- [ ] Monthly comparison muestra tendencias correctas
- [ ] Recent activity combina 3 fuentes
- [ ] Credit cards solo aparece si hay tarjetas
- [ ] Mobile responsive funciona
- [ ] Performance < 500ms TTFB
- [ ] No hay datos de otros usuarios (RLS test)

---

## Migración y Deployment

### Migración de Datos:

```sql
-- Si existen usuarios con localStorage data, no hay migración necesaria
-- Todo se inicializa con valores por defecto

-- Insertar settings iniciales para usuarios existentes
INSERT INTO user_dashboard_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

### Orden de Deployment:

1. **Migration**: Ejecutar `004_dashboard_tables.sql`
2. **Seed**: Insertar logros predefinidos en `achievements`
3. **API**: Deploy endpoints en `/api/dashboard/*`
4. **Components**: Deploy componentes de dashboard
5. **Testing**: Validar en staging
6. **Production**: Deploy gradual con feature flags

---

## Notas Técnicas

### Performance:

- Usar `React.memo` para cards individuales
- Implementar `useMemo` para cálculos complejos
- Lazy load componentes con `next/dynamic`
- Cachear en servidor cuando sea posible

### Seguridad:

- Todas las tablas tienen RLS habilitado
- Verificar auth en todos los endpoints
- Validar input con Yup/Zod
- No exponer datos de otros usuarios

### Accessibility:

- Aria-labels en botones toggle
- Suficiente contraste en colores de alerta
- Navegación por teclado funcional
- Screen reader friendly

---

**Versión:** 2.0  
**Última actualización:** Marzo 2026  
**Status:** Listo para implementación con persistencia en BD
