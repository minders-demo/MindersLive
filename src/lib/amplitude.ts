import {
  Experiment,
  type ExperimentClient,
  type ExperimentUser,
  type ExperimentUserProvider,
  type Exposure,
  type ExposureTrackingProvider,
} from '@amplitude/experiment-js-client';

declare global {
  interface Window {
    amplitude: any;
    amplitudeReady?: Promise<unknown>;
    sessionReplay: any;
    engagement: any;
  }
}

export type HomeCardsExperimentVariant = 'control' | 'treatment';

export const AMPLITUDE_API_KEY =
  '149c1b2572d16bf0d4035a897f1abfca';

export const EXPERIMENT_DEPLOYMENT_KEY =
  String(
    import.meta.env.VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY || '',
  ).trim() || AMPLITUDE_API_KEY;

export const HOME_CARDS_EXPERIMENT_FLAG_KEY =
  String(
    import.meta.env.VITE_AMPLITUDE_EXPERIMENT_FLAG_KEY || '',
  ).trim() || 'exp-home-01-live-demand-cards';

export const GUIDES_SURVEYS_KEY = AMPLITUDE_API_KEY;

let experimentClient: ExperimentClient | null = null;
let experimentInitialization: Promise<void> | null = null;

let homeCardsVariantCache: {
  identityKey: string;
  value: HomeCardsExperimentVariant;
} | null = null;

function amp(): any | null {
  return typeof window !== 'undefined' && window.amplitude
    ? window.amplitude
    : null;
}

function getExperimentIdentityKey(): string {
  const analytics = amp();
  const userId = analytics?.getUserId?.() || '';
  const deviceId = analytics?.getDeviceId?.() || '';

  return `${userId}::${deviceId}`;
}

function getDeviceCategory(): ExperimentUser['device_category'] {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1024px)').matches) return 'tablet';

  return 'desktop';
}

const experimentUserProvider: ExperimentUserProvider = {
  getUser(): ExperimentUser {
    const analytics = amp();

    return {
      user_id: analytics?.getUserId?.() || undefined,
      device_id: analytics?.getDeviceId?.() || undefined,
      device_category: getDeviceCategory(),
      language:
        typeof navigator !== 'undefined'
          ? navigator.language
          : undefined,
      platform: 'Web',
      user_agent:
        typeof navigator !== 'undefined'
          ? navigator.userAgent
          : undefined,
    };
  },
};

const exposureTrackingProvider: ExposureTrackingProvider = {
  track(exposure: Exposure) {
    trackEvent('$exposure', {
      flag_key: exposure.flag_key,
      variant: exposure.variant,
      experiment_key: exposure.experiment_key,
      metadata: exposure.metadata,
    });
  },
};

function normalizeEmail(
  email?: string | null,
): string | undefined {
  const normalized = String(email || '').trim().toLowerCase();

  return normalized.includes('@') ? normalized : undefined;
}

export function buildStableUserId(
  seed?: string | null,
): string | undefined {
  const value =
    normalizeEmail(seed) ||
    String(seed || '').trim().toLowerCase();

  if (!value) return undefined;

  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash =
      ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  const positiveHash = Math.abs(hash).toString(36);

  return `ml_user_${positiveHash}`;
}

function fallbackUserId(): string {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);

  return `ml_user_${randomPart}`;
}

export function createAppUserId(email?: string | null): string {
  return buildStableUserId(email) || fallbackUserId();
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
) {
  const analytics = amp();

  if (!analytics) {
    console.warn('[Amplitude] SDK no disponible aún:', eventName);
    return;
  }

  analytics.track(eventName, properties || {});
}

export function identifyUser(
  userProperties: Record<string, any>,
) {
  const analytics = amp();

  if (!analytics) {
    console.warn(
      '[Amplitude] SDK no disponible para identify',
      userProperties,
    );
    return;
  }

  const explicitId =
    userProperties.user_id ||
    userProperties.userId ||
    userProperties.id;

  const derivedId = explicitId
    ? String(explicitId)
    : buildStableUserId(userProperties.email);

  const amplitudeUserId =
    derivedId && derivedId.length >= 5
      ? derivedId
      : undefined;

  if (amplitudeUserId) {
    analytics.setUserId(amplitudeUserId);
  }

  const identify = new analytics.Identify();

  Object.entries(userProperties).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return;
    }

    if (['user_id', 'userId', 'id'].includes(key)) {
      return;
    }

    identify.set(key, value as any);
  });

  if (amplitudeUserId) {
    identify.set('app_user_id', amplitudeUserId);
  }

  analytics.identify(identify);
}

export function resetUser() {
  const analytics = amp();

  analytics?.reset?.();
  experimentClient?.clear();
  homeCardsVariantCache = null;
}

export function flushEvents() {
  amp()?.flush?.();
}

export async function initializeFeatureExperiment(): Promise<void> {
  if (experimentInitialization) {
    return experimentInitialization;
  }

  experimentInitialization = (async () => {
    try {
      await window.amplitudeReady;
    } catch (error) {
      console.warn(
        '[Amplitude Analytics] La inicialización no terminó correctamente.',
        error,
      );
    }

    try {
      experimentClient = Experiment.initialize(
        EXPERIMENT_DEPLOYMENT_KEY,
        {
          instanceName: 'minders-live-home-cards',
          userProvider: experimentUserProvider,
          exposureTrackingProvider,
          automaticExposureTracking: true,
          fetchTimeoutMillis: 1500,
        },
      );

      await experimentClient.fetch();
      homeCardsVariantCache = null;
    } catch (error) {
      console.warn(
        '[Amplitude Experiment] No fue posible obtener variantes. Se usará control.',
        error,
      );
    }
  })();

  return experimentInitialization;
}

export async function fetchExperimentVariants(): Promise<void> {
  await initializeFeatureExperiment();

  try {
    await experimentClient?.fetch();
    homeCardsVariantCache = null;
  } catch (error) {
    console.warn(
      '[Amplitude Experiment] No fue posible actualizar variantes.',
      error,
    );
  }
}

export function getExperimentVariant(
  flagKey: string,
  fallback: HomeCardsExperimentVariant = 'control',
): HomeCardsExperimentVariant {
  const value = experimentClient?.variant(
    flagKey,
    {value: fallback},
  ).value;

  return value === 'treatment' ? 'treatment' : 'control';
}

export function getHomeCardsExperimentVariant(): HomeCardsExperimentVariant {
  const identityKey = getExperimentIdentityKey();

  if (homeCardsVariantCache?.identityKey === identityKey) {
    return homeCardsVariantCache.value;
  }

  const value = getExperimentVariant(
    HOME_CARDS_EXPERIMENT_FLAG_KEY,
    'control',
  );

  homeCardsVariantCache = {
    identityKey,
    value,
  };

  return value;
}

export function setExperimentVariant(
  flagKey: string,
  variant: string,
) {
  trackEvent('$exposure', {
    flag_key: flagKey,
    variant,
  });
}

export function triggerGuide(guideName: string) {
  trackEvent('Guide Trigger Requested', {
    guide_name: guideName,
  });
}

export function triggerSurvey(surveyName: string) {
  trackEvent('Survey Trigger Requested', {
    survey_name: surveyName,
  });
}
