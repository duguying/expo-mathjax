// ─────────────────────────────────────────────────────────────────────────────
// SVG render result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The result of converting TeX / MathML to SVG.
 * Pass svgString directly to SvgXml from react-native-svg.
 */
export interface SvgData {
    /** Complete SVG XML string, ready for SvgXml. */
    svgString: string;
    /** Formula width in CSS ex units. */
    exWidth: number;
    /** Formula height in CSS ex units. */
    exHeight: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component props
// ─────────────────────────────────────────────────────────────────────────────

export interface MathViewProps {
    /** LaTeX source, e.g. "x^2 + y^2 = z^2". */
    tex?: string;
    /** MathML source (alternative to tex). */
    mathml?: string;
    /** Display (block) math vs inline math. Default: true */
    display?: boolean;
    /** Foreground colour passed to SvgXml's color prop. Default: '#000000' */
    color?: string;
    /** Optional background colour. Default: transparent */
    backgroundColor?: string;
    /**
     * Font size in dp used to scale the formula.
     * 1 ex ≈ 0.5 * fontSize dp.  Default: 16.
     */
    fontSize?: number;
    /** Called when rendering is complete with the rendered dimensions (dp). */
    onLayout?: (event: { width: number; height: number }) => void;
    style?: object;
}
