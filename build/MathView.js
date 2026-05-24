"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MathView – the public React component.
 *
 * Converts the given TeX / MathML source to an SVG string using MathJax's
 * SVG pipeline (JS thread, no native bridge), then renders it with SvgXml
 * from react-native-svg.  Works in Expo Go without any native build step.
 */
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_svg_1 = require("react-native-svg");
const MathJaxConverter_1 = require("./MathJaxConverter");
/**
 * Approximate dp per ex unit at a 16 dp base font size.
 * 1 ex ≈ 0.5 em ≈ 0.5 * 16 dp = 8 dp.
 */
const EX_TO_DP = 8;
const MathView = ({ tex, mathml, display = true, color = "#000000", backgroundColor, fontSize = 16, onLayout, style, }) => {
    const [svgState, setSvgState] = React.useState(null);
    const [error, setError] = React.useState(null);
    const scale = fontSize / 16;
    React.useEffect(() => {
        var _a;
        setError(null);
        try {
            let data;
            if (tex !== undefined) {
                data = (0, MathJaxConverter_1.texToSvg)(tex, { display });
            }
            else if (mathml !== undefined) {
                data = (0, MathJaxConverter_1.mathmlToSvg)(mathml, { display });
            }
            else {
                return;
            }
            setSvgState({
                svgString: data.svgString,
                width: data.exWidth * EX_TO_DP * scale,
                height: data.exHeight * EX_TO_DP * scale,
            });
        }
        catch (e) {
            setError(String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e));
        }
    }, [tex, mathml, display, scale]);
    if (error || !svgState) {
        return React.createElement(react_native_1.View, { style: [styles.placeholder, style] });
    }
    return (React.createElement(react_native_1.View, { style: [
            { width: svgState.width, height: svgState.height },
            backgroundColor ? { backgroundColor } : null,
            style,
        ], onLayout: onLayout
            ? (e) => onLayout({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height,
            })
            : undefined },
        React.createElement(react_native_svg_1.SvgXml, { xml: svgState.svgString, width: svgState.width, height: svgState.height, color: color })));
};
const styles = react_native_1.StyleSheet.create({
    placeholder: {
        minWidth: 1,
        minHeight: 1,
    },
});
exports.default = MathView;
