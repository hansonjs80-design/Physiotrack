export const LANDSCAPE_GRID_IDS = [1, 2, null, 11, 3, 4, 5, 6, 10, 9, 8, 7];

export interface BedPairConfig {
  left: number;
  right: number | null;
}

export const PORTRAIT_PAIRS_CONFIG: BedPairConfig[] = [
  { left: 1, right: 11 },
  { left: 2, right: null },
  { left: 3, right: 10 },
  { left: 4, right: 9 },
  { left: 5, right: 8 },
  { left: 6, right: 7 },
];