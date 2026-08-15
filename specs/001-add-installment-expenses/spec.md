# Feature Specification: Add Installment Expenses

**Feature Branch**: `001-add-installment-expenses`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "users need to be able to add expenses that are in monthly installments, so that for example a user bought something that costs $600 and is for 6 monthly installments, it should only show $100 for the current month, and populate future months with the installments."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar un gasto en cuotas mensuales (Priority: P1)

Como usuario que compra un producto o servicio financiado, quiero registrar el monto total y la cantidad de cuotas mensuales para que mi presupuesto mensual refleje solo la parte correspondiente a cada mes.

**Why this priority**: Es el valor principal de la funcionalidad. Sin esta capacidad, las compras grandes distorsionan el presupuesto del mes actual y ocultan compromisos futuros.

**Independent Test**: Se puede probar registrando una compra de 600 por 6 cuotas desde el flujo de gastos y verificando que el mes actual muestre 100 como gasto mensual, no 600.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado en el registro de gastos, **When** ingresa un gasto de 600 con 6 cuotas mensuales, **Then** el gasto del mes actual aumenta en 100 y no en 600.
2. **Given** un usuario registra un gasto en cuotas, **When** completa los datos obligatorios del gasto, **Then** el sistema crea un calendario mensual con una cuota por mes hasta completar el total.
3. **Given** un usuario intenta registrar un gasto en cuotas, **When** la cantidad de cuotas es menor que 2 o el monto total no es positivo, **Then** el sistema impide guardar y muestra un mensaje claro en español.

---

### User Story 2 - Ver cuotas futuras en el presupuesto (Priority: P2)

Como usuario que planifica sus finanzas, quiero que las cuotas futuras aparezcan en los meses correspondientes para anticipar mis gastos comprometidos.

**Why this priority**: Permite tomar mejores decisiones antes de hacer nuevas compras y evita sorpresas en meses futuros.

**Independent Test**: Se puede probar registrando un gasto de 600 en 6 cuotas y revisando los próximos seis meses para confirmar que cada mes incluye una cuota de 100.

**Acceptance Scenarios**:

1. **Given** un gasto de 600 registrado en 6 cuotas desde agosto, **When** el usuario consulta septiembre, octubre, noviembre, diciembre y enero, **Then** cada mes muestra una cuota de 100 asociada al gasto original.
2. **Given** el usuario consulta un mes posterior a la última cuota, **When** revisa el presupuesto de ese mes, **Then** el gasto en cuotas ya no aparece en los totales de ese mes.
3. **Given** un gasto en cuotas pertenece a una categoría con límite mensual, **When** el sistema calcula el uso de esa categoría para un mes, **Then** solo considera la cuota correspondiente a ese mes.

---

### User Story 3 - Distinguir gastos únicos de gastos en cuotas (Priority: P3)

Como usuario que revisa mis gastos, quiero identificar cuáles gastos son pagos únicos y cuáles son cuotas de una compra financiada para entender el origen de mis compromisos mensuales.

**Why this priority**: Mejora la claridad del historial y reduce confusión al revisar gastos repetidos en distintos meses.

**Independent Test**: Se puede probar registrando un gasto único y un gasto en cuotas, luego revisando el listado mensual para confirmar que las cuotas se muestran como parte de una serie y los gastos únicos como registros normales.

**Acceptance Scenarios**:

1. **Given** un mes con gastos únicos y cuotas, **When** el usuario revisa el listado de gastos, **Then** cada cuota indica que forma parte de una compra en cuotas y muestra su número dentro de la serie.
2. **Given** una cuota futura, **When** el usuario ve sus detalles, **Then** puede identificar el monto total original, la cantidad total de cuotas y el avance de la cuota actual.

---

### Edge Cases

- Si el monto total no se divide exactamente por la cantidad de cuotas, el sistema debe distribuir el redondeo de forma que la suma de todas las cuotas sea exactamente igual al monto total.
- Si la fecha inicial del gasto está en un mes futuro, la primera cuota debe aparecer en ese mes futuro y no en el mes actual.
- Si el usuario elige una sola cuota, el gasto debe tratarse como un gasto único y no como una serie de cuotas.
- Si una cuota cae en un cambio de año, las cuotas deben continuar en los meses correctos del año siguiente.
- Si el usuario elimina una compra en cuotas, debe quedar claro que se eliminarán las cuotas pendientes y las cuotas visibles relacionadas con esa compra.
- Si el usuario edita una compra en cuotas, el sistema debe evitar que el total de cuotas quede inconsistente con el monto total original.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir que un usuario registre un gasto como pago único o como gasto en cuotas mensuales.
- **FR-002**: El sistema MUST solicitar el monto total, la cantidad de cuotas, la fecha de inicio, la categoría y la descripción para un gasto en cuotas.
- **FR-003**: El sistema MUST calcular el monto mensual de cada cuota a partir del monto total y la cantidad de cuotas.
- **FR-004**: El sistema MUST crear una cuota por cada mes de la serie, empezando por el mes de la fecha de inicio.
- **FR-005**: El sistema MUST reflejar en los totales de cada mes únicamente las cuotas que corresponden a ese mes.
- **FR-006**: El sistema MUST asegurar que la suma de todas las cuotas sea igual al monto total registrado por el usuario.
- **FR-007**: El sistema MUST incluir las cuotas mensuales en los cálculos de gasto por categoría y advertencias de límite mensual.
- **FR-008**: El sistema MUST mostrar en español que un gasto pertenece a una serie de cuotas, incluyendo el número de cuota y el total de cuotas.
- **FR-009**: El sistema MUST permitir que el usuario vea el monto total original, el monto de cada cuota, la cantidad total de cuotas, la fecha inicial y la fecha final estimada.
- **FR-010**: El sistema MUST validar que el monto total sea mayor que cero y que la cantidad de cuotas sea un número entero positivo.
- **FR-011**: El sistema MUST tratar los gastos de una sola cuota como gastos únicos para evitar crear series innecesarias.
- **FR-012**: El sistema MUST impedir que los gastos en cuotas de un usuario sean visibles o modificables por otros usuarios.
- **FR-013**: El sistema SHOULD permitir eliminar una compra en cuotas completa con una confirmación clara antes de afectar múltiples meses.
- **FR-014**: El sistema SHOULD permitir editar una compra en cuotas manteniendo la coherencia entre monto total, cantidad de cuotas y cuotas mensuales resultantes.

### Key Entities *(include if feature involves data)*

- **Compra en cuotas**: Representa una compra financiada por un usuario. Incluye descripción, categoría, monto total, cantidad total de cuotas, fecha de inicio, fecha final estimada y estado.
- **Cuota mensual**: Representa el cargo mensual derivado de una compra en cuotas. Incluye monto de la cuota, mes aplicable, número de cuota, total de cuotas y relación con la compra original.
- **Gasto mensual**: Representa el impacto financiero visible en un mes específico. Puede originarse de un gasto único o de una cuota mensual.
- **Categoría de presupuesto**: Agrupa gastos únicos y cuotas mensuales para calcular uso, límites y advertencias por mes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 95% de los usuarios puede registrar un gasto en cuotas mensuales correctamente en menos de 2 minutos.
- **SC-002**: Para gastos en cuotas, el 100% de los presupuestos mensuales muestra solo el monto de la cuota correspondiente a ese mes.
- **SC-003**: En el 100% de los casos, la suma de las cuotas generadas coincide exactamente con el monto total registrado.
- **SC-004**: El 90% de los usuarios entiende al revisar el listado si un cargo es un gasto único o una cuota de una compra financiada, sin ayuda externa.
- **SC-005**: Las advertencias de límite por categoría reflejan correctamente las cuotas mensuales en al menos el 99% de los escenarios de validación.
- **SC-006**: Los usuarios pueden revisar cuotas futuras hasta el final de la serie sin perder visibilidad de compromisos mensuales.

## Assumptions

- La interfaz visible para usuarios debe estar en español.
- Las cuotas son mensuales y consecutivas; otros intervalos de pago quedan fuera de esta versión.
- La primera cuota se aplica al mes de la fecha de inicio elegida por el usuario.
- El monto total se interpreta como el costo completo de la compra, no como el monto de cada cuota.
- Los gastos en cuotas impactan el presupuesto y los límites de categoría del mes correspondiente a cada cuota.
- La moneda y el formato de importes siguen la configuración existente del producto.
- Si el usuario no elige cuotas o elige una sola cuota, el gasto se considera un gasto único.
