/**
 * expo-mathjax example app
 *
 * Demonstrates MathView rendering of various LaTeX expressions.
 * Run on a real device / simulator with:
 *   cd example && npx expo run:ios
 *   cd example && npx expo run:android
 */
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import { MathView } from "expo-mathjax";

// ── Sample expressions ───────────────────────────────────────────────────────
const SAMPLES: { label: string; tex: string; display: boolean }[] = [
    {
        label: "Inline fraction",
        tex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        display: false,
    },
    {
        label: "Display integral",
        tex: "\\int_{-\\infty}^{+\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}",
        display: true,
    },
    {
        label: "Matrix",
        tex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
        display: true,
    },
    {
        label: "Sum / product",
        tex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
        display: true,
    },
    {
        label: "Maxwell's equations",
        tex: "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}",
        display: true,
    },
    {
        label: "Greek & arrows",
        tex: "\\alpha + \\beta \\rightarrow \\gamma \\otimes \\delta",
        display: false,
    },
    {
        label: "Square root",
        tex: "\\sqrt[3]{x^3 + y^3} \\neq x + y",
        display: true,
    },
    {
        label: "Big fraction",
        tex: "\\frac{d}{dx}\\left(\\frac{1}{1+e^{-x}}\\right) = \\frac{e^{-x}}{(1+e^{-x})^2}",
        display: true,
    },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function IndexScreen() {
    const scheme = useColorScheme();
    const dark = scheme === "dark";
    const fg = dark ? "#e8e8e8" : "#111111";
    const bg = dark ? "#1c1c1e" : "#ffffff";

    const [customTex, setCustomTex] = useState("");
    const [sizes, setSizes] = useState<Record<string, string>>({});

    const onLayout =
        (label: string) => (size: { width: number; height: number }) => {
            setSizes((prev) => ({
                ...prev,
                [label]: `${size.width.toFixed(0)} × ${size.height.toFixed(0)} pt`,
            }));
        };

    return (
        <ScrollView
            style={[styles.root, { backgroundColor: bg }]}
            contentContainerStyle={styles.content}
        >
            {/* ── Live editor ────────────────────────────────────────── */}
            <View style={styles.section}>
                <Text style={[styles.heading, { color: fg }]}>Live editor</Text>
                <TextInput
                    style={[styles.input, { color: fg, borderColor: fg }]}
                    placeholder="Type LaTeX here…"
                    placeholderTextColor={dark ? "#888" : "#aaa"}
                    value={customTex}
                    onChangeText={setCustomTex}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {customTex.length > 0 && (
                    <View style={styles.card}>
                        <MathView
                            tex={customTex}
                            display
                            color={fg}
                            style={styles.math}
                            onLayout={onLayout("custom")}
                        />
                        {sizes["custom"] && (
                            <Text
                                style={[
                                    styles.meta,
                                    { color: dark ? "#888" : "#aaa" },
                                ]}
                            >
                                {sizes["custom"]}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* ── Sample gallery ─────────────────────────────────────── */}
            <View style={styles.section}>
                <Text style={[styles.heading, { color: fg }]}>
                    Sample gallery
                </Text>
                {SAMPLES.map((s) => (
                    <View
                        key={s.label}
                        style={[
                            styles.card,
                            { borderColor: dark ? "#333" : "#ddd" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.label,
                                { color: dark ? "#aaa" : "#666" },
                            ]}
                        >
                            {s.label}
                        </Text>
                        <MathView
                            tex={s.tex}
                            display={s.display}
                            color={fg}
                            style={styles.math}
                            onLayout={onLayout(s.label)}
                        />
                        {sizes[s.label] && (
                            <Text
                                style={[
                                    styles.meta,
                                    { color: dark ? "#555" : "#bbb" },
                                ]}
                            >
                                {sizes[s.label]}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1 },
    content: { padding: 16, paddingBottom: 48 },
    section: { marginBottom: 24 },
    heading: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "transparent",
    },
    label: { fontSize: 12, marginBottom: 6 },
    math: { width: "100%" },
    meta: { fontSize: 10, textAlign: "right", marginTop: 4 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontFamily: "monospace",
        fontSize: 14,
        marginBottom: 12,
    },
});
