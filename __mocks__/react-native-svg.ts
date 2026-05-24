/**
 * Minimal Jest mock for react-native-svg.
 * SvgXml is a React component that renders nothing in tests.
 */
import * as React from "react";

export const SvgXml: React.FC<{
    xml?: string;
    width?: any;
    height?: any;
}> = () => null;

export default { SvgXml };
