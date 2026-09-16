/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY?: string;
  readonly VITE_AMPLITUDE_EXPERIMENT_FLAG_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
