/// <reference types="vite/client" />
declare module "virtual:content" {
  const value: import("./lib/model").Content;
  export default value;
}
