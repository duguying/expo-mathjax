# expo-mathjax

MathJax-powered math rendering for React Native — **no native build, no WebView, works in Expo Go**.

Renders TeX and MathML via [MathJax](https://www.mathjax.org/) on the JS thread, then displays the resulting SVG with [`react-native-svg`](https://github.com/software-mansion/react-native-svg).

## Features

- TeX and MathML input
- Display and inline modes
- Colour theming via a single `color` prop
- LRU cache (128 entries) for fast re-renders
- Zero native code — works in **Expo Go** without `expo prebuild`

## Architecture

```
TeX / MathML
    │
    ▼  mathjax-full (liteAdaptor, JS thread — no DOM required)
  SVG string
    │
    ▼  react-native-svg (SvgXml)
  Rendered view
```

## Installation

```bash
npm install expo-mathjax mathjax-full react-native-svg
```

For managed Expo projects:

```bash
npx expo install expo-mathjax react-native-svg
```

## Usage

### `<MathView>` component

```tsx
import { MathView } from 'expo-mathjax';

// TeX display mode
<MathView tex="\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" />

// TeX inline mode with custom colour
<MathView tex="E = mc^2" display={false} color="#e74c3c" fontSize={18} />

// MathML
<MathView mathml="<math><mi>x</mi><mo>+</mo><mn>1</mn></math>" />
```

### Props

| Prop              | Type        | Default     | Description                         |
|-------------------|-------------|-------------|-------------------------------------|
| `tex`             | `string`    | —           | LaTeX/TeX input                     |
| `mathml`          | `string`    | —           | MathML input                        |
| `display`         | `boolean`   | `true`      | Display (block) vs inline mode      |
| `color`           | `string`    | `"#000000"` | Formula colour (CSS colour string)  |
| `backgroundColor` | `string`    | —           | Background colour of the container  |
| `fontSize`        | `number`    | `16`        | Base font size in dp                |
| `style`           | `ViewStyle` | —           | Extra styles for the container View |
| `onLayout`        | `function`  | —           | View `onLayout` callback            |

### Low-level API

```ts
import { texToSvg, mathmlToSvg, clearCache, configure, ALL_PACKAGES } from 'expo-mathjax';

// Configure TeX packages before first render (optional)
configure({ packages: ALL_PACKAGES });

// Convert to SVG directly
const { svgString, exWidth, exHeight } = texToSvg('x^2 + y^2 = r^2', { display: true });

// Clear the LRU cache
clearCache();
```

### TeX packages

By default `COMMON_PACKAGES` are loaded (base, ams, newcommand, …). To enable more:

```ts
import { configure, COMMON_PACKAGES } from 'expo-mathjax';

configure({ packages: [...COMMON_PACKAGES, 'mhchem', 'physics'] });
```

Call `configure()` once at app startup, before the first render.

## Peer Dependencies

| Package            | Version    |
|--------------------|------------|
| `react`            | `*`        |
| `react-native`     | `*`        |
| `react-native-svg` | `>=13.0.0` |

## License

MIT
