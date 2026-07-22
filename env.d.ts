/// <reference types="vite/client" />

declare module 'file-saver' {
  export function saveAs(data: Blob | File | string, filename?: string, options?: any): void
  export const save: typeof saveAs
  export default saveAs
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
