// src/lib/session-events.ts

/**
 * Helper para invalidar la sesión después de acciones importantes
 * Esto evita polling constante y solo refresca cuando realmente es necesario
 */

export function invalidateSession() {
  window.dispatchEvent(new CustomEvent('session:invalidate'));
}

/**
 * Úsalo después de estas acciones:
 * 
 * 1. Crear un dataset
 * 2. Generar un insight
 * 3. Ingerir muchos data points
 * 4. Cambiar suscripción (upgrade/downgrade/cancel)
 * 5. Actualizar preferencias de usuario
 * 
 * Ejemplo de uso:
 * 
 * ```typescript
 * // En tu componente después de crear un dataset
 * const createDataset = async (data) => {
 *   const response = await fetch('/api/datasets', {
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   });
 *   
 *   if (response.ok) {
 *     invalidateSession(); // ✅ Refrescar límites
 *   }
 * };
 * ```
 */

// También puedes crear helpers específicos para optimizar aún más

export function invalidateAfterDatasetCreation() {
  invalidateSession();
}

export function invalidateAfterInsightGeneration() {
  invalidateSession();
}

export function invalidateAfterSubscriptionChange() {
  invalidateSession();
}

export function invalidateAfterSettingsUpdate() {
  invalidateSession();
}