// Type stub for leaflet — loaded via CDN or direct import
declare module "leaflet" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L: any;
  export default L;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const map: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const tileLayer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const marker: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const icon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const divIcon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const latLng: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const latLngBounds: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const polyline: any;
  export type Map = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type Marker = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type TileLayer = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type LatLng = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type LatLngTuple = [number, number] | [number, number, number];
  export type LatLngBounds = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type Layer = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type Icon = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type DivIcon = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export type Polyline = any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}

// Augment the L namespace used as L.Map, L.Marker, etc.
declare namespace L {
  type Map = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type Marker = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type TileLayer = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type LatLng = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type LatLngTuple = [number, number] | [number, number, number];
  type LatLngBounds = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type Layer = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type Icon = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type DivIcon = any; // eslint-disable-line @typescript-eslint/no-explicit-any
  type Polyline = any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
