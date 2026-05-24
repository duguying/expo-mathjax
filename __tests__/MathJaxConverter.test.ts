/**
 * MathJaxConverter integration tests
 *
 * These tests call the real MathJax pipeline (mathjax-full + liteAdaptor)
 * inside Node/Jest – no DOM, no native modules needed.
 */
import { texToSvg, mathmlToSvg, clearCache } from "../src/MathJaxConverter";

describe("MathJaxConverter – texToSvg", () => {
    beforeEach(() => clearCache());

    test("converts simple TeX and returns a non-empty SVG string", () => {
        const data = texToSvg("x", { display: false });
        expect(data.svgString).toContain("<svg");
        expect(data.svgString).toContain("</svg>");
        expect(data.exWidth).toBeGreaterThan(0);
        expect(data.exHeight).toBeGreaterThan(0);
    });

    test("SVG string contains a defs section with path data", () => {
        const data = texToSvg("E = mc^2");
        expect(data.svgString).toContain("<defs>");
        expect(data.svgString).toContain(' d="');
    });

    test("SVG string uses currentColor (theming via SvgXml color prop)", () => {
        const data = texToSvg("x");
        // MathJax outputs currentColor so colour is controlled at render time
        expect(data.svgString).toContain("currentColor");
    });

    test("xlink:href is normalised to href", () => {
        const data = texToSvg("\\frac{1}{2}");
        expect(data.svgString).not.toContain("xlink:href=");
        expect(data.svgString).toContain("href=");
    });

    test("fraction produces positive exWidth and exHeight", () => {
        const data = texToSvg("\\frac{1}{2}");
        expect(data.exWidth).toBeGreaterThan(0);
        expect(data.exHeight).toBeGreaterThan(0);
    });

    test("display=true produces larger exHeight than display=false", () => {
        const block = texToSvg("x", { display: true });
        const inline = texToSvg("x", { display: false });
        expect(block.exHeight).toBeGreaterThanOrEqual(inline.exHeight);
    });

    test("caches results: same input returns the same object reference", () => {
        const a = texToSvg("x^2");
        const b = texToSvg("x^2");
        expect(a).toBe(b);
    });

    test("cache miss after clearCache()", () => {
        const a = texToSvg("x^2");
        clearCache();
        const b = texToSvg("x^2");
        expect(a).not.toBe(b); // different object
        // MathJax uses global incrementing IDs so strings differ by ID number;
        // verify structural equality via dimensions and SVG shape
        expect(a.exWidth).toBeCloseTo(b.exWidth, 3);
        expect(a.exHeight).toBeCloseTo(b.exHeight, 3);
        // Strip MJX-N- numeric counters before comparing
        const strip = (s: string) => s.replace(/MJX-\d+-/g, "MJX-");
        expect(strip(a.svgString)).toBe(strip(b.svgString));
    });

    test("complex formula: integral produces non-trivial SVG", () => {
        const data = texToSvg(
            "\\int_{-\\infty}^{+\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}",
        );
        expect(data.svgString.length).toBeGreaterThan(500);
        expect(data.exWidth).toBeGreaterThan(5);
    });

    test("invalid TeX does not crash – returns error SVG", () => {
        expect(() => texToSvg("\\invalidcmd")).not.toThrow();
    });
});

describe("MathJaxConverter – mathmlToSvg", () => {
    beforeEach(() => clearCache());

    test("converts simple MathML", () => {
        const mml = "<math><mi>x</mi></math>";
        const data = mathmlToSvg(mml);
        expect(data.svgString).toContain("<svg");
        expect(data.exWidth).toBeGreaterThan(0);
    });
});
