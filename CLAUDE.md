# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
make install      # Install root dependencies
make build        # Compile TypeScript (npm install + tsc)
make watch        # TypeScript watch mode
make test         # Run Jest tests
make test:watch   # Jest interactive watch mode
make lint         # Type-check without emitting (tsc --noEmit)

make example/install   # Install example app dependencies
make example/start     # Start Expo dev server

make dev               # Run build + example/start in parallel

# Direct commands (package.json)
npm run build          # tsc
npm run test           # jest
npm run test:watch     # jest --watch
```

Note: `make example/install` requires `--legacy-peer-deps` due to React Native / expo dependency conflicts.

## Architecture

### Rendering Pipeline

```
TeX/MathML → MathJax SVG jax (JS thread) → SVG string
                                             │
                                             ▼
                                    SvgXml (react-native-svg)
```

No native code, no expo prebuild required.  Works with Expo Go.

**JS Layer (`src/`):**
- `MathJaxConverter.ts` — MathJax init (liteAdaptor + TeX/MathML input + SVG output jax), LRU cache (128 entries). Outputs `SvgData = { svgString, exWidth, exHeight }`.
- `MathView.tsx` — React component; converts TeX/MathML → SVG string, renders via SvgXml. Colour is set via SvgXml's `color` prop (maps to SVG `currentColor`).

**Key Files:**
- `src/types.ts` — `SvgData` and `MathViewProps`
- `src/MathView.tsx` — React component wrapper (uses `SvgXml` from react-native-svg)
- `src/index.ts` — public exports (`MathView`, `texToSvg`, `mathmlToSvg`, `clearCache`, `configure`, `COMMON_PACKAGES`, `ALL_PACKAGES`)

### Colour Handling

MathJax SVG output uses `fill="currentColor"` on glyph groups.  The `color`
prop on `MathView` is forwarded to `SvgXml`'s `color` prop which sets the CSS
`currentColor` variable, cascading to all fills.  Explicit inline colours from
`\color{}` TeX commands are unaffected.

### Example App

`example/` is an Expo Router app (entry: `expo-router/entry`). It lives in a separate `node_modules` tree — sibling dependency via `"expo-mathjax": "file:../"` in example's package.json.

### tsconfig.json Notes

- `moduleResolution: "node16"` + `module: "Node16"` (bundler was incompatible with CommonJS)
- If you change `module`, ensure `moduleResolution` is compatible
