/**
 * Amplitude wrapper — usa el Unified Script cargado desde index.html.
 * Expone las mismas firmas que el mock anterior, pero llama al SDK real.
 */

// --- Tipos para los globales que carga el CDN ----------------------------
declare global {
  interface Window {
    amplitude: any;   // @amplitude/analytics-browser
    sessionReplay: any;
    engagement: any;  // @amplitude/engagement-browser
    experiment: any;  // @amplitude/experiment-js-client (Feature Experiment)
  }
}

// --- Constantes (compatibilidad con el código existente) -----------------
export const AMPLITUDE_API_KEY = "149c1b2572d16bf0d4035a897f1abfca";
export const EXPERIMENT_DEPLOYMENT_KEY = ""; // se rellena al crear un Deployment en Amplitude > Experiment
export const GUIDES_SURVEYS_KEY = AMPLITUDE_API_KEY; // misma project key

// Helper: el script puede no haber terminado de cargar en el primer render
function amp(): any | null {
  return typeof window !== "undefined" && window.amplitude ? window.amplitude : null;
}

// --- API pública ---------------------------------------------------------

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
 * Setea user properties. Si pasas user_id o email, también se identifica al usuario.
 * Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2
 */
export function identifyUser(userProperties: Record<string, any>) {
  const a = amp();
  if (!a) return;

  // Si llega un id explícito úsalo como Amplitude userId
  if (userProperties.user_id) a.setUserId(String(userProperties.user_id));
  if (userProperties.email) a.setUserId(String(userProperties.email));

  const identify = new a.Identify();
  Object.entries(userProperties).forEach(([key, value]) => {
    if (value !== undefined && value !== null) identify.set(key, value as any);
  });
  a.identify(identify);
}

/**
 * Marca exposición a una variante. Útil cuando el variante se decide localmente
 * (DemoControls) y queremos que Amplitude lo registre como $exposure.
 * Ref: https://amplitude.com/docs/sdks/experiment-sdks/experiment-javascript
 */
export function setExperimentVariant(flagKey: string, variant: string) {
  const a = amp();
  if (!a) return;
  a.track("$exposure", { flag_key: flagKey, variant });
}

/**
 * Lee una variante real desde Amplitude Experiment (Feature Experiment).
 * Llama a `await fetchExperimentVariants()` una vez tras identificar al usuario
 * y luego usa esto para leer cada flag.
 */
export function getExperimentVariant(flagKey: string): string | undefined {
  return window.experiment?.variant(flagKey)?.value;
}

/** Trae todas las variantes asignadas al usuario actual. Llamar tras identifyUser(). */
export async function fetchExperimentVariants() {
  if (!window.experiment) return;
  try {
    await window.experiment.fetch();
  } catch (e) {
    console.warn("[Amplitude Experiment] fetch falló:", e);
  }
}

/**
 * Dispara un Guide. En Amplitude el patrón recomendado es targetear el guide
 * por evento — así que aquí emitimos un evento que tu Guide escuchará en la UI.
 * Ref: https://amplitude.com/docs/guides-and-surveys/sdk
 */
export function triggerGuide(guideName: string) {
  trackEvent("Guide Trigger Requested", { guide_name: guideName });
}

/** Idem para Surveys. */
export function triggerSurvey(surveyName: string) {
  trackEvent("Survey Trigger Requested", { survey_name: surveyName });
}
