/**
 * MathView – the public React component.
 *
 * Converts the given TeX / MathML source to an SVG string using MathJax's
 * SVG pipeline (JS thread, no native bridge), then renders it with SvgXml
 * from react-native-svg.  Works in Expo Go without any native build step.
 */
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { MathViewProps } from "./types";
import { texToSvg, mathmlToSvg } from "./MathJaxConverter";

/**
 * Approximate dp per ex unit at a 16 dp base font size.
 * 1 ex ≈ 0.5 em ≈ 0.5 * 16 dp = 8 dp.
 */
const EX_TO_DP = 8;

const MathView: React.FC<MathViewProps> = ({
    tex,
    mathml,
    display = true,
    color = "#000000",
    backgroundColor,
    fontSize = 16,
    onLayout,
    style,
}) => {
    const [svgState, setSvgState] = React.useState<{
        svgString: string;
        width: number;
        height: number;
    } | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const scale = fontSize / 16;

    React.useEffect(() => {
        setError(null);
        try {
            let data;
            if (tex !== undefined) {
                data = texToSvg(tex, { display });
            } else if (mathml !== undefined) {
                data = mathmlToSvg(mathml, { display });
            } else {
                return;
            }
            setSvgState({
                svgString: data.svgString,
                width: data.exWidth * EX_TO_DP * scale,
                height: data.exHeight * EX_TO_DP * scale,
            });
        } catch (e: any) {
            setError(String(e?.message ?? e));
        }
    }, [tex, mathml, display, scale]);

    if (error || !svgState) {
        return <View style={[styles.placeholder, style]} />;
    }

    return (
        <View
            style={[
                { width: svgState.width, height: svgState.height },
                backgroundColor ? { backgroundColor } : null,
                style,
            ]}
            onLayout={
                onLayout
                    ? (e) =>
                          onLayout({
                              width: e.nativeEvent.layout.width,
                              height: e.nativeEvent.layout.height,
                          })
                    : undefined
            }
        >
            <SvgXml
                xml={svgState.svgString}
                width={svgState.width}
                height={svgState.height}
                color={color}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    placeholder: {
        minWidth: 1,
        minHeight: 1,
    },
});

export default MathView;
