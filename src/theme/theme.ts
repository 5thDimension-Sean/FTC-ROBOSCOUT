/**
 * Design tokens and light/dark palettes.
 */
export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  red: string;
  blue: string;
  success: string;
  danger: string;
  star: string;
}

export const lightPalette: Palette = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F5',
  border: '#DDE2E8',
  text: '#141821',
  textMuted: '#5C6672',
  primary: '#0A6CFF',
  primaryText: '#FFFFFF',
  accent: '#FF6B2C',
  red: '#E23B3B',
  blue: '#2C6BE2',
  success: '#1F9D55',
  danger: '#E23B3B',
  star: '#F5B301',
};

export const darkPalette: Palette = {
  background: '#0E1116',
  surface: '#171B22',
  surfaceAlt: '#1F242D',
  border: '#2A313B',
  text: '#EDF0F4',
  textMuted: '#9AA4B1',
  primary: '#3B8BFF',
  primaryText: '#FFFFFF',
  accent: '#FF7A3D',
  red: '#F26161',
  blue: '#5C93F2',
  success: '#39C07A',
  danger: '#F26161',
  star: '#FFC531',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};
