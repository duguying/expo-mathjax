"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PACKAGES = exports.COMMON_PACKAGES = void 0;
exports.configure = configure;
exports.texToSvg = texToSvg;
exports.mathmlToSvg = mathmlToSvg;
exports.clearCache = clearCache;
// ── Package presets ──────────────────────────────────────────────────────────
/**
 * Minimal TeX package set covering the vast majority of math rendered in
 * mobile apps: standard math mode, AMS environments/symbols, custom macros,
 * bold symbols, piecewise cases, and colour.
 */
exports.COMMON_PACKAGES = [
    "base",
    "ams",
    "newcommand",
    "boldsymbol",
    "cases",
    "color",
];
/**
 * Full package list – equivalent to AllPackages from mathjax-full.
 * Pass to configure() when chemistry (mhchem), physics notation, proof trees,
 * commutative diagrams, etc. are needed.
 */
exports.ALL_PACKAGES = [
    "base",
    "action",
    "ams",
    "amscd",
    "bbox",
    "boldsymbol",
    "braket",
    "bussproofs",
    "cancel",
    "cases",
    "centernot",
    "color",
    "colorv2",
    "colortbl",
    "configmacros",
    "empheq",
    "enclose",
    "extpfeil",
    "gensymb",
    "html",
    "mathtools",
    "mhchem",
    "newcommand",
    "noerrors",
    "noundefined",
    "physics",
    "setoptions",
    "tagformat",
    "textcomp",
    "textmacros",
    "upgreek",
    "unicode",
    "verb",
];
// Maps each package name to its configuration module path inside mathjax-full.
// Static require map — Metro bundler requires all require() calls to be
// statically analysable (no template literals or computed paths).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEX_PKG_LOADERS = {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    base: () => require("mathjax-full/js/input/tex/base/BaseConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    action: () => require("mathjax-full/js/input/tex/action/ActionConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ams: () => require("mathjax-full/js/input/tex/ams/AmsConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    amscd: () => require("mathjax-full/js/input/tex/amscd/AmsCdConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    bbox: () => require("mathjax-full/js/input/tex/bbox/BboxConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    boldsymbol: () => require("mathjax-full/js/input/tex/boldsymbol/BoldsymbolConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    braket: () => require("mathjax-full/js/input/tex/braket/BraketConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    bussproofs: () => require("mathjax-full/js/input/tex/bussproofs/BussproofsConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cancel: () => require("mathjax-full/js/input/tex/cancel/CancelConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cases: () => require("mathjax-full/js/input/tex/cases/CasesConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    centernot: () => require("mathjax-full/js/input/tex/centernot/CenternotConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    color: () => require("mathjax-full/js/input/tex/color/ColorConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    colorv2: () => require("mathjax-full/js/input/tex/colorv2/ColorV2Configuration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    colortbl: () => require("mathjax-full/js/input/tex/colortbl/ColortblConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    configmacros: () => require("mathjax-full/js/input/tex/configmacros/ConfigMacrosConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    empheq: () => require("mathjax-full/js/input/tex/empheq/EmpheqConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    enclose: () => require("mathjax-full/js/input/tex/enclose/EncloseConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    extpfeil: () => require("mathjax-full/js/input/tex/extpfeil/ExtpfeilConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    gensymb: () => require("mathjax-full/js/input/tex/gensymb/GensymbConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    html: () => require("mathjax-full/js/input/tex/html/HtmlConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mathtools: () => require("mathjax-full/js/input/tex/mathtools/MathtoolsConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mhchem: () => require("mathjax-full/js/input/tex/mhchem/MhchemConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    newcommand: () => require("mathjax-full/js/input/tex/newcommand/NewcommandConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    noerrors: () => require("mathjax-full/js/input/tex/noerrors/NoErrorsConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    noundefined: () => require("mathjax-full/js/input/tex/noundefined/NoUndefinedConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    physics: () => require("mathjax-full/js/input/tex/physics/PhysicsConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    setoptions: () => require("mathjax-full/js/input/tex/setoptions/SetOptionsConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    tagformat: () => require("mathjax-full/js/input/tex/tagformat/TagFormatConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    textcomp: () => require("mathjax-full/js/input/tex/textcomp/TextcompConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    textmacros: () => require("mathjax-full/js/input/tex/textmacros/TextMacrosConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    upgreek: () => require("mathjax-full/js/input/tex/upgreek/UpgreekConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    unicode: () => require("mathjax-full/js/input/tex/unicode/UnicodeConfiguration.js"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    verb: () => require("mathjax-full/js/input/tex/verb/VerbConfiguration.js"),
};
// ── Global configuration (must be set before first render) ───────────────────
let _configuredPackages = exports.COMMON_PACKAGES;
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
function configure(opts) {
    if (_initialized)
        return; // too late – engine already started
    if (opts.packages)
        _configuredPackages = opts.packages;
}
// ── Lazy engine state ────────────────────────────────────────────────────────
let _initialized = false;
let _adaptor;
let _texDoc;
let _mathmlDoc;
function ensureInitialized() {
    var _a;
    if (_initialized)
        return;
    _initialized = true;
    // These are synchronous requires; liteAdaptor needs no DOM.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { liteAdaptor } = require("mathjax-full/js/adaptors/liteAdaptor.js");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RegisterHTMLHandler } = require("mathjax-full/js/handlers/html.js");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TeX } = require("mathjax-full/js/input/tex.js");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MathML } = require("mathjax-full/js/input/mathml.js");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SVG } = require("mathjax-full/js/output/svg.js");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { mathjax } = require("mathjax-full/js/mathjax.js");
    // Load only the configuration modules for the requested packages.
    // Each require() call is a side-effect that registers the package with
    // MathJax's global package registry.
    for (const pkg of _configuredPackages) {
        (_a = TEX_PKG_LOADERS[pkg]) === null || _a === void 0 ? void 0 : _a.call(TEX_PKG_LOADERS);
    }
    _adaptor = liteAdaptor();
    RegisterHTMLHandler(_adaptor);
    const tex = new TeX({ packages: _configuredPackages });
    const mml = new MathML();
    // SVG output with local font-cache (paths stored in <defs>, referenced via <use>)
    const svgJax = new SVG({
        fontCache: "local",
    });
    _texDoc = mathjax.document("", { InputJax: tex, OutputJax: svgJax });
    _mathmlDoc = mathjax.document("", { InputJax: mml, OutputJax: svgJax });
}
// ── LRU-style cache: keyed by "mode:display:input" ──────────────────────────
const MAX_CACHE = 128;
const _cache = new Map();
function cacheKey(mode, input, display) {
    return `${mode}:${display ? "1" : "0"}:${input}`;
}
// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Parse an ex-unit dimension attribute from MathJax SVG output.
 * e.g. "1.394ex" → 1.394,  "2.5em" → 5 (1em ≈ 2ex),  "" → 0
 */
function parseExValue(attr) {
    var _a;
    if (!attr)
        return 0;
    const m = attr.match(/^([\d.eE+-]+)(ex|em)?/i);
    if (!m)
        return 0;
    const num = parseFloat(m[1]);
    if (!isFinite(num))
        return 0;
    return ((_a = m[2]) !== null && _a !== void 0 ? _a : "").toLowerCase() === "em" ? num * 2 : num;
}
/**
 * Post-process the raw SVG string produced by MathJax:
 *  - Replace xlink:href with href for react-native-svg compatibility.
 *
 * MathJax uses fill="currentColor" on elements, so colour is controlled
 * at render time via SvgXml's `color` prop rather than by post-processing.
 */
function buildSvgData(svgEl) {
    const exWidth = parseExValue(_adaptor.getAttribute(svgEl, "width"));
    const exHeight = parseExValue(_adaptor.getAttribute(svgEl, "height"));
    let svgString = _adaptor.outerHTML(svgEl);
    // Normalize deprecated xlink:href → href
    svgString = svgString.replace(/xlink:href=/g, "href=");
    return { svgString, exWidth, exHeight };
}
function setInCache(key, data) {
    if (_cache.size >= MAX_CACHE) {
        const oldest = _cache.keys().next().value;
        if (oldest !== undefined)
            _cache.delete(oldest);
    }
    _cache.set(key, data);
}
/**
 * Convert a LaTeX string to an SvgData payload.
 *
 * The returned svgString is a complete SVG XML document ready to be
 * rendered by SvgXml from react-native-svg.  Pass the `color` prop to
 * SvgXml (or use MathView's `color` prop) to control the foreground colour.
 */
function texToSvg(tex, opts = {}) {
    var _a;
    const { display = true } = opts;
    const key = cacheKey("tex", tex, display);
    if (_cache.has(key))
        return _cache.get(key);
    ensureInitialized();
    // MathJax returns an mjx-container LiteElement wrapping the <svg>
    const container = _texDoc.convert(tex, { display });
    const svgEl = (_a = container.children) === null || _a === void 0 ? void 0 : _a[0];
    if (!svgEl)
        throw new Error(`MathJax produced no SVG for: ${tex}`);
    const data = buildSvgData(svgEl);
    setInCache(key, data);
    return data;
}
/**
 * Convert a MathML string to an SvgData payload.
 */
function mathmlToSvg(mathml, opts = {}) {
    var _a;
    const { display = true } = opts;
    const key = cacheKey("mml", mathml, display);
    if (_cache.has(key))
        return _cache.get(key);
    ensureInitialized();
    const container = _mathmlDoc.convert(mathml, { display });
    const svgEl = (_a = container.children) === null || _a === void 0 ? void 0 : _a[0];
    if (!svgEl)
        throw new Error(`MathJax produced no SVG for MathML input`);
    const data = buildSvgData(svgEl);
    setInCache(key, data);
    return data;
}
/** Clear the render cache (e.g. when colour theme changes). */
function clearCache() {
    _cache.clear();
}
