/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_GA4_MEASUREMENT_ID?: string;
}
declare module "virtual:content" {
  const value: import("./lib/model").Content;
  export default value;
}
