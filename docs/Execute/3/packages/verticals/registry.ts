// Map vertical keys to dynamic imports
export const registry: Record<string, () => Promise<any>> = {
  cleaning: () => import('./cleaning')
  // add more: fencing: () => import('./fencing'), etc.
};
export type VerticalMeta = {
  key: string;
  nav: { label: string; path: string; }[];
  routes: { path: string; element: any }[]; // React elements (admin shell)
};
