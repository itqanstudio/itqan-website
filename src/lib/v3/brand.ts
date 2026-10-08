/**
 * Brand v3 ("Resolve, the signal i") geometry and icon data.
 * Source of truth: the private repo itqanstudio/itqan-brand (README.md).
 *
 * The symbol sits on a 10 x 12 module grid. Each rect is [x, y, width] with a
 * height of one module. The first rect is the dot of the i and is always rose.
 * The symbol is never mirrored, also not in right-to-left layouts.
 */
export type Rect = readonly [x: number, y: number, w: number];

export const SYMBOL_RECTS: readonly Rect[] = [
  [0, 0, 1],
  [0, 2, 1], [0, 3, 4], [0, 4, 6], [0, 5, 1], [3, 5, 4], [0, 6, 2], [5, 6, 3],
  [0, 7, 4], [6, 7, 2], [0, 8, 1], [2, 8, 3], [6, 8, 3], [0, 9, 1], [3, 9, 2],
  [7, 9, 2], [0, 10, 2], [4, 10, 2], [7, 10, 2], [0, 11, 3], [4, 11, 2], [7, 11, 3],
];

export const ROSE = '#EF3A78';
export const INK = '#0B0A0D';
export const BONE = '#F5F1EA';

/** The dusk run, as gradient stops from the bottom-left corner of the grid. */
export const DUSK_STOPS: readonly (readonly [offset: number, color: string])[] = [
  [0, '#F5D3A1'],
  [0.3, '#F89A5B'],
  [0.55, '#F4664F'],
  [0.8, '#EF3A78'],
  [1, '#9B3FA0'],
];

const DUSK_RGB: readonly (readonly [number, readonly [number, number, number]])[] = [
  [0, [245, 211, 161]],
  [0.3, [248, 154, 91]],
  [0.55, [244, 102, 79]],
  [0.8, [239, 58, 120]],
  [1, [155, 63, 160]],
];

/** One module per cell, in drawing order; index 0 is the dot. */
export const SYMBOL_CELLS: readonly (readonly [number, number])[] = SYMBOL_RECTS.flatMap(
  ([x, y, w]) => Array.from({ length: w }, (_, i) => [x + i, y] as const),
);

/**
 * Colour of one module under the radial dusk gradient (cx 0, cy 12, r 13.4),
 * sampled at the module centre. Used by the canvas, which cannot use SVG paint.
 */
export function cellColor(x: number, y: number): string {
  const t = Math.min(1, Math.hypot(x + 0.5, 12 - (y + 0.5)) / 13.4);
  for (let i = 0; i < DUSK_RGB.length - 1; i += 1) {
    const [t0, a] = DUSK_RGB[i];
    const [t1, b] = DUSK_RGB[i + 1];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      const mix = (k: 0 | 1 | 2) => Math.round(a[k] + (b[k] - a[k]) * u);
      return `rgb(${mix(0)},${mix(1)},${mix(2)})`;
    }
  }
  return '#9B3FA0';
}

/**
 * pixelarticons (MIT, Gerrit Halfmann), 24 px grid. Only the icons the site
 * uses are embedded, each as one or more filled paths.
 */
export const ICONS = {
  buildings: ['M2 2h14v4h6v16H2V2zm18 6h-4v2h2v2h-2v2h2v2h-2v2h2v2h2V8zm-6-4H4v16h2v-2h6v2h2V4zM6 6h2v2H6V6zm6 0h-2v2h2V6zm-6 4h2v2H6v-2zm6 0h-2v2h2v-2zm-6 4h2v2H6v-2zm6 0h-2v2h2v-2z'],
  store: ['M3 13h2v8H3zm2 8h14v2H5zm14-8h2v8h-2zm-9-2h4v2h-4zm4-2h4v2h-4zm4 2h4v2h-4zM6 9h4v2H6zm-4 2h4v2H2zM0 7h2v4H0zm2-2h2v2H2zm18 0h2v2h-2zm2 2h2v4h-2zM4 3h16v2H4zm6 12h4v2h-4zm-2 2h2v4H8zm6 0h2v4h-2z'],
  coffee: ['M4 4h16v2H4zm0 2h2v8H4zm2 8h10v2H6zm14-8h2v4h-2zm-2 4h2v2h-2zm-2-4h2v8h-2zM2 18h18v2H2z'],
  'message-processing': ['M4 2h18v16H6v2H4v-2h2v-2h14V4H4v18H2V2h2zm5 7H7v2h2V9zm2 0h2v2h-2V9zm6 0h-2v2h2V9z'],
  'file-flash': ['M19 22h-6v-2h6V10h-6V4H5v8H3V2h12v2h2v2h2v2h2v14h-2zM17 6h-2v2h2V6zM7 12h2v4h4v2h-2v2H9v2H7v-4H3v-2h2v-2h2v-2z'],
  server: ['M6 7h4v2H6zm0 8h4v2H6zM2 5h2v14H2zm18 0h2v14h-2zM4 19h16v2H4zM4 3h16v2H4zm0 8h16v2H4z'],
  sliders: ['M8 14H7v6H5v-6H2v-2h6v2Zm5 6h-2V10h2v10Zm9-2h-3v2h-2v-2h-1v-2h6v2Zm-3-4h-2V4h2v10ZM7 10H5V4h2v6Zm6-4h2v2H9V6h2V4h2v2Z'],
  users: ['M5 2h6v2H5zm10 0h4v2h-4zM5 10h6v2H5zm10 0h4v2h-4zm4-6h2v6h-2zm-8 0h2v6h-2zM3 4h2v6H3zM0 18h2v4H0zm14 0h2v4h-2zm8 0h2v4h-2zM4 14h8v2H4zm12 0h4v2h-4zM2 16h2v2H2zm10 0h2v2h-2zm8 0h2v2h-2z'],
  map: ['M4 20h2v2H2V6h2v14Zm12 0h2v2h-4v-2h-2v-2h2V8h-2V6h4v14Zm-8 0H6v-2h2v2Zm12 0h-2v-2h2v2ZM10 4h2v2h-2v10h2v2H8V4H6V2h4v2Zm12 14h-2V4h-2V2h4v16ZM6 6H4V4h2v2Zm12 0h-2V4h2v2Z'],
  lock: ['M5 8h14v2H5zm0 12h14v2H5zM3 10h2v10H3zm16 0h2v10h-2zM7 4h2v4H7zm2-2h6v2H9zm6 2h2v4h-2z'],
  'card-id': ['M2 4h20v16H2V4zm2 2v4h16V6H4zm16 6H10v2h10v-2zm0 4h-4v2h4v-2zm-6 2v-2H4v2h10zM4 14h4v-2H4v2z'],
  analytics: ['M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zm-9 8h2v6h-2zm-4 2h2v4H7zm8-8h2v12h-2z'],
  shield: ['M4 2h16v2H4zM2 4h2v10H2zm18 0h2v10h-2zM4 14h2v2H4zm2 2h2v2H6zm4 4h4v2h-4zm10-6h-2v2h2zm-2 2h-2v2h2zm-2 2h-2v2h2zm-6 0H8v2h2z'],
} as const;

export type IconName = keyof typeof ICONS;

export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, name);
}
