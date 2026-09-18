/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_CURRENCY: string;
  readonly VITE_CURRENCY_SYMBOL: string;
  readonly VITE_FREE_SHIPPING_THRESHOLD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
