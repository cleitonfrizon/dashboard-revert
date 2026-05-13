/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DASHBOARD_API_URL: string;
  readonly VITE_DASHBOARD_API_TOKEN: string;
  readonly VITE_DASHBOARD_PASSWORD_HASH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
