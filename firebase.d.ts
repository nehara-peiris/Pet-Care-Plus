declare module "firebase/auth" {
  export * from "@firebase/auth";
  export function getReactNativePersistence(storage: any): any;
}
