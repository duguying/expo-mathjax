/**
 * MathView – the public React component.
 *
 * Converts the given TeX / MathML source to an SVG string using MathJax's
 * SVG pipeline (JS thread, no native bridge), then renders it with SvgXml
 * from react-native-svg.  Works in Expo Go without any native build step.
 */
import * as React from "react";
import { MathViewProps } from "./types";
declare const MathView: React.FC<MathViewProps>;
export default MathView;
