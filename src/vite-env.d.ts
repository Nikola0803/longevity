/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WOO_STORE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
