export {};

declare global {
  interface Window {
    __baSessionId?: string;
    storage?: any;
  }
}
