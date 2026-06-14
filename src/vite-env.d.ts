/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API key for the PenguWave events backend (see .env.example). */
  readonly VITE_API_KEY?: string;
  /** Optional override for the backend base URL. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
