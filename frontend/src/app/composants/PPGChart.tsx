import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Canvas, Path } from "@shopify/react-native-skia";

export default function PPGChart({
  pathIR,
  currentIR,
}: {
  pathIR: any;
  currentIR: any;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signal PPG (IR)</Text>
      <Canvas style={styles.canvas}>
        <Path path={pathIR} color="#FD4755" style="stroke" strokeWidth={3} />
      </Canvas>
      <Text style={styles.irVal}>Valeur brute: {Math.round(currentIR)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 15,
    elevation: 2,
  },
  title: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 10 },
  canvas: { height: 150, width: "100%" },
  irVal: { fontSize: 10, color: "#AAA", textAlign: "right", marginTop: 5 },
});
