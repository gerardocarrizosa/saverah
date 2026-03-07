# Saverah - Gestión de Finanzas Personales

Una aplicación web para gestionar recordatorios de pagos, controlar gastos y mantener tu presupuesto personal en orden.

## Características

- **Recordatorios de pagos**: Nunca olvides una fecha de vencimiento para tarjetas, servicios y suscripciones
- **Control de gastos**: Registra ingresos y gastos por categoría
- **Presupuesto mensual**: Establece límites de gasto por categoría y recibe alertas
- **Análisis financiero**: Visualiza tendencias y obtén insights sobre tus hábitos de gasto
- **Autenticación segura**: Inicio de sesión con Supabase Auth

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Forms**: Formik + Yup
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

## Configuración Rápida

### 1. Clonar el repositorio

```bash
git clone <tu-repo-url>
cd saverah
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a **Settings** > **API** y copia:
   - Project URL
   - anon public API key
3. Copia `.env.local` y agrega tus credenciales:

```bash
cp .env.local .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Crear las tablas en la base de datos

**Opción A - Usando el SQL Editor (Recomendado):**

1. Ve al dashboard de Supabase
2. Abre **SQL Editor** en el menú lateral
3. Copia el contenido de `supabase/migrations/001_initial_schema.sql`
4. Pega en el editor y ejecuta

**Opción B - Ver guía detallada:**

Consulta [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) para instrucciones detalladas.

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
.
├── app/
│   ├── (auth)/              # Páginas públicas (login, signup)
│   ├── (app)/               # Páginas protegidas (dashboard, reminders, budget)
│   ├── api/                 # API Routes (RESTful)
│   ├── page.tsx             # Landing page
│   └── layout.tsx           # Root layout
├── components/              # Componentes React
├── lib/
│   ├── api/                 # Capa de acceso a datos (Server)
│   ├── axios/               # Configuración de Axios
│   ├── supabase/            # Clientes Supabase
│   ├── utils/               # Utilidades (fechas, moneda)
│   └── validations/         # Esquemas Yup
├── hooks/                   # Custom hooks (useReminders, useBudget, useAnalytics)
├── types/                   # Definiciones TypeScript
├── config/                  # Constantes de la app
├── supabase/
│   └── migrations/          # Migraciones SQL
└── docs/
    └── SUPABASE_SETUP.md    # Guía de configuración de Supabase
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reminders` | Lista todos los recordatorios |
| POST | `/api/reminders` | Crea un nuevo recordatorio |
| GET | `/api/reminders/:id` | Obtiene un recordatorio |
| PATCH | `/api/reminders/:id` | Actualiza un recordatorio |
| DELETE | `/api/reminders/:id` | Elimina un recordatorio |
| GET | `/api/analytics/reminders/:id` | Analytics de un recordatorio |
| GET | `/api/budget/income` | Lista todos los ingresos |
| POST | `/api/budget/income` | Agrega un ingreso |
| GET | `/api/budget/expenses` | Lista todos los gastos |
| POST | `/api/budget/expenses` | Agrega un gasto |
| PATCH | `/api/budget/expenses/:id` | Actualiza un gasto |
| DELETE | `/api/budget/expenses/:id` | Elimina un gasto |
| GET | `/api/budget/summary` | Resumen del presupuesto |

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Construcción
npm run build        # Compila para producción
npm run start        # Inicia servidor de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
```

## Arquitectura

### Patrón de Datos

```
Client Component → Axios → /api/route → lib/api/ → Supabase DB
Server Component → lib/api/ → Supabase DB
```

### Principios Clave

1. **API Routes como capa de datos primaria**: Todas las lecturas y mutaciones pasan por `app/api/`
2. **Axios para todas las peticiones HTTP del cliente**: Nunca usar `fetch` directamente
3. **Server Components para render SSR inicial**: Las páginas obtienen datos directamente desde `lib/api/`
4. **Formik + Yup para formularios**: Validación compartida entre cliente y servidor
5. **RLS obligatorio en todas las tablas**: Cada tabla tiene políticas de seguridad por usuario

## Despliegue

### Vercel (Recomendado)

1. Push a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Despliega!

### Variables de Entorno de Producción

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

## Documentación Adicional

- [Guía de Configuración de Supabase](docs/SUPABASE_SETUP.md) - Instrucciones detalladas para configurar la base de datos
- [AGENTS.md](AGENTS.md) - Convenciones y guías para desarrolladores/AI agents

## Contribuir

1. Fork el repositorio
2. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -am 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## Soporte

¿Tienes preguntas o problemas?

- Abre un [Issue](https://github.com/tu-usuario/saverah/issues)
- Consulta la [documentación de Supabase](https://supabase.com/docs)
- Revisa la [documentación de Next.js](https://nextjs.org/docs)

---

**Nota**: Esta aplicación está diseñada para uso personal. Los datos se almacenan de forma segura en tu proyecto de Supabase con RLS habilitado.
