export const AMPLITUDE_API_KEY = "mock_amplitude_api_key";
export const EXPERIMENT_DEPLOYMENT_KEY = "mock_experiment_deployment_key";
export const GUIDES_SURVEYS_KEY = "mock_guides_surveys_key";

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  console.log(`[AMPLITUDE EVENT] ${eventName}`, properties || {});
  // Here we would call amplitude.track(eventName, properties)
}

export function identifyUser(userProperties: Record<string, any>) {
  console.log(`[AMPLITUDE IDENTIFY]`, userProperties);
  // Here we would call amplitude.identify(new amplitude.Identify().set(key, value))
}

export function setExperimentVariant(flagKey: string, variant: string) {
  console.log(`[AMPLITUDE EXPERIMENT] Set flag ${flagKey} to ${variant}`);
  // Here we would integrate with Amplitude Experiment SDK
}

export function triggerGuide(guideName: string) {
  console.log(`[AMPLITUDE GUIDE] Triggered guide: ${guideName}`);
  // Here we would call Guides & Surveys SDK
}

export function triggerSurvey(surveyName: string) {
  console.log(`[AMPLITUDE SURVEY] Triggered survey: ${surveyName}`);
  // Here we would call Guides & Surveys SDK
}
