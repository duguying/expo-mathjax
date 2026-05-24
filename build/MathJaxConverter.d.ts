/**
 * MathJaxConverter – converts a LaTeX / MathML string into an SVG string
 * using MathJax's SVG output pipeline (mathjax-full + liteAdaptor).
 *
 * Rendering pipeline:
 *   TeX/MathML → MML tree → SVG output jax → LiteElement SVG tree
 *                                            → outerHTML SVG string
 *
 * The liteAdaptor is specifically designed for non-browser environments
 * (Node / Hermes / JSC) – no DOM required.
 * The resulting SVG string is passed directly to react-native-svg's SvgXml.
 *
 * Package loading strategy:
 *   Instead of requiring AllPackages.js (which side-effect-loads all 35 TeX
 *   extension modules upfront), we only require the config files for the
 *   packages in use. This meaningfully reduces cold-start JS parse time on
 *   Hermes/JSC where every module is parsed eagerly.
 */
import { SvgData } from "./types";
/**
 * Minimal TeX package set covering the vast majority of math rendered in
 * mobile apps: standard math mode, AMS environments/symbols, custom macros,
 * bold symbols, piecewise cases, and colour.
 */
export declare const COMMON_PACKAGES: string[];
/**
 * Full package list – equivalent to AllPackages from mathjax-full.
 * Pass to configure() when chemistry (mhchem), physics notation, proof trees,
 * commutative diagrams, etc. are needed.
 */
export declare const ALL_PACKAGES: string[];
export interface ConfigureOptions {
    /**
     * TeX extension packages to enable.
     * Defaults to COMMON_PACKAGES.
     * Use ALL_PACKAGES or a custom list to opt-in to additional packages.
     * Has no effect after the first render call.
     */
    packages?: string[];
}
/**
 * Configure the TeX engine before the first render.
 * Call this once at app startup if you need packages beyond COMMON_PACKAGES.
 *
 * @example
 *   import { configure, ALL_PACKAGES } from 'expo-mathjax';
 *   configure({ packages: ALL_PACKAGES });   // opt-in to full package set
 *
 * @example
 *   configure({ packages: [...COMMON_PACKAGES, 'mhchem', 'physics'] });
 */
export declare function configure(opts: ConfigureOptions): void;
export interface ConvertOptions {
    display?: boolean;
}
/**
 * Convert a LaTeX string to an SvgData payload.
 *
 * The returned svgString is a complete SVG XML document ready to be
 * rendered by SvgXml from react-native-svg.  Pass the `color` prop to
 * SvgXml (or use MathView's `color` prop) to control the foreground colour.
 */
export declare function texToSvg(tex: string, opts?: ConvertOptions): SvgData;
/**
 * Convert a MathML string to an SvgData payload.
 */
export declare function mathmlToSvg(mathml: string, opts?: ConvertOptions): SvgData;
/** Clear the render cache (e.g. when colour theme changes). */
export declare function clearCache(): void;
