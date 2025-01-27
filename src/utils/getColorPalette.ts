/* globals __getColorPalette */
/* globals __getColorPalette */
import type {Frame} from 'react-native-vision-camera';

export interface PaletteColor {
  color: string;
  count: number; // Number of pixels for this color
}

export interface PaletteWithCounts {
  primary: PaletteColor;
  secondary: PaletteColor;
  background: PaletteColor;
  detail: PaletteColor;
  totalPixels: number; // Total number of pixels in the frame
}

// Final structure returned by `getColorPalette`
export interface Palette {
  primary: { color: string; percentage: number };
  secondary: { color: string; percentage: number };
  background: { color: string; percentage: number };
  detail: { color: string; percentage: number };
}

/**
 * * `'lowest'`: Resize Frame to 50px width
 * * `'low'`: Resize Frame to 100px width
 * * `'high'`: Resize Frame to 250px width
 * * `'highest'`: Don't resize Frame at all
 */
export type ColorPaletteQuality = 'lowest' | 'low' | 'high' | 'highest';

// Frame Processor Plugin name
declare global {
  var __getColorPalette: (
    frame: Frame,
    quality: ColorPaletteQuality,
  ) => PaletteWithCounts | undefined | null;
}

export function getColorPalette(
  frame: Frame,
  quality: ColorPaletteQuality = 'highest',
): Palette | undefined | null {
  'worklet';

  // Call the native function and assume it returns `PaletteWithCounts`
  const rawPalette = __getColorPalette(frame, quality);

  if (!rawPalette) {
    return null;
  }

  // Extract properties using `PaletteWithCounts`
  const { primary, secondary, background, detail, totalPixels } = rawPalette;

  // Calculate percentages
  const calculatePercentage = (count: number) =>
    count && totalPixels ? (count / totalPixels) * 100 : 0;

  const primaryPercentage = calculatePercentage(primary.count);

  console.log(
    '+++ Primary Count:',
    primary.count,
    'Total Pixels:',
    totalPixels,
    'Percentage:',
    primaryPercentage
  );

  // Convert rawPalette to Palette with percentages
  return {
    primary: {
      color: primary.color,
      percentage: calculatePercentage(primary.count),
    },
    secondary: {
      color: secondary.color,
      percentage: calculatePercentage(secondary.count),
    },
    background: {
      color: background.color,
      percentage: calculatePercentage(background.count),
    },
    detail: {
      color: detail.color,
      percentage: calculatePercentage(detail.count),
    },
  };
}
