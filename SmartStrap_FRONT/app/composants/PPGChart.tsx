import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Canvas, Path, Skia, Line } from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");
const GRAPH_HEIGHT = 150;

export default function PPGChart({ pathIR, currentIR } : { pathIR: any, currentIR: any }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Signal PPG (Infrarouge)</Text>
                <Text style={styles.value}>{currentIR.toFixed(0)}</Text>
            </View>
            <View style={styles.graphWrapper}>
                <Canvas style={{ flex: 1 }}>
                    <Line p1={{ x: 0, y: GRAPH_HEIGHT / 2 }} p2={{ x: width, y: GRAPH_HEIGHT / 2 }} color="#222" strokeWidth={1} />
                    <Path path={pathIR} color="#00FF88" style="stroke" strokeWidth={2} antiAlias />
                </Canvas>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 20, paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    title: { color: '#666', fontSize: 14, fontFamily: "LeagueSpartan_Bold" },
    value: { color: '#00FF88', fontWeight: 'bold' },
    graphWrapper: { height: GRAPH_HEIGHT, backgroundColor: '#0A0A0A', borderRadius: 15, overflow: 'hidden' }
});