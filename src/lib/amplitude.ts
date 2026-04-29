/**
 * Amplitude wrapper — usa el Unified Script cargado desde index.html.
 * Expone funciones simples para Analytics, Identify, Session Replay,
 * Guides/Surveys y Experiment sin acoplar la app al SDK directamente.
 */

declare global {
  interface Window {
    amplitude: any;   // @amplitude/analytics-browser / unified script
    sessionReplay: any;
    engagement: any;  // @amplitude/engagement-browser
    experiment: any;  // @amplitude/experiment-js-client
  }
}

export const AMPLITUDE_API_KEY = "149c1b2572d16bf0d4035a897f1abfca";
export const EXPERIMENT_DEPLOYMENT_KEY = "";
export const GUIDES_SURVEYS_KEY = AMPLITUDE_API_KEY;

function amp(): any | null {
  return typeof window !== "undefined" && window.amplitude ? window.amplitude : null;
}

function normalizeEmail(email?: string | null): string | undefined {
  const normalized = String(email || "").trim().toLowerCase();
  return normalized.includes("@") ? normalized : undefined;
}

/**
 * Crea un ID estable para Amplitude a partir del correo.
 * No usamos el email directamente como User ID para evitar exponer PII como identificador.
 */
export function buildStableUserId(seed?: string | null): string | undefined {
  const value = normalizeEmail(seed) || String(seed || "").trim().toLowerCase();
  if (!value) return undefined;

  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }

  const positiveHash = Math.abs(hash).toString(36);
  return `ml_user_${positiveHash}`;
}

function fallbackUserId(): string {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);

  return `ml_user_${randomPart}`;
}

export function createAppUserId(email?: string | null): string {
  return buildStableUserId(email) || fallbackUserId();
}

/** Envía un evento custom a Amplitude Analytics. */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  const a = amp();
  if (!a) {
    console.warn("[Amplitude] SDK no disponible aún:", eventName);
    return;
  }

  a.track(eventName, properties || {});
}

/**
 * Identifica al usuario actual en Amplitude.
 * - Si recibe user_id/userId/id, lo usa como Amplitude User ID.
 * - Si no recibe ID pero sí email, crea un ID estable basado en hash del email.
 * - Además guarda propiedades de usuario con identify().
 */
export function identifyUser(userProperties: Record<string, any>) {
  const a = amp();
  if (!a) {
    console.warn("[Amplitude] SDK no disponible para identify", userProperties);
    return;
  }

  const explicitId = userProperties.user_id || userProperties.userId || userProperties.id;
  const derivedId = explicitId ? String(explicitId) : buildStableUserId(userProperties.email);
  const amplitudeUserId = derivedId && derivedId.length >= 5 ? derivedId : undefined;

  if (amplitudeUserId) {
    a.setUserId(amplitudeUserId);
  }

  const identify = new a.Identify();

  Object.entries(userProperties).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (["user_id", "userId", "id"].includes(key)) return;
    identify.set(key, value as any);
  });

  if (amplitudeUserId) {
    identify.set("app_user_id", amplitudeUserId);
  }

  a.identify(identify);
}

/**
 * Úsalo en logout o cuando quieras iniciar una simulación con otro usuario.
 * Limpia el userId y genera un nuevo deviceId en Amplitude.
 */
export function resetUser() {
  const a = amp();
  if (!a) return;
  a.reset();
}

/** Fuerza el envío del buffer de eventos. Útil para pruebas/demo. */
export function flushEvents() {
  const a = amp();
  if (!a) return;
  a.flush?.();
}

export function setExperimentVariant(flagKey: string, variant: string) {
  trackEvent("$exposure", { flag_key: flagKey, variant });
}

export function getExperimentVariant(flagKey: string): string | undefined {
  return window.experiment?.variant(flagKey)?.value;
}

export async function fetchExperimentVariants() {
  if (!window.experiment) return;
  try {
    await window.experiment.fetch();
  } catch (e) {
    console.warn("[Amplitude Experiment] fetch falló:", e);
  }
}

export function triggerGuide(guideName: string) {
  trackEvent("Guide Trigger Requested", { guide_name: guideName });
}

export function triggerSurvey(surveyName: string) {
  trackEvent("Survey Trigger Requested", { survey_name: surveyName });
}
