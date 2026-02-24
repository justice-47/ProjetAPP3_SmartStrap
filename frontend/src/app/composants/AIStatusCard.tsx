import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Severity } from "../../types/health";

interface AIProps {
  rpm: number;
  stateLabel: string;
  healthStatus?: string;
  severity?: Severity;
}

export default function AIStatusCard({
  rpm,
  stateLabel,
  healthStatus,
  severity,
}: AIProps) {
  const isCritical = severity === "critical";
  const accentColor = isCritical ? "#FF4444" : "#00386A";

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="light" style={styles.card}>
        <View
          style={[styles.statusHeader, { backgroundColor: accentColor + "15" }]}
        >
          <Text style={[styles.statusText, { color: accentColor }]}>
            DIAGNOSTIC : {healthStatus?.toUpperCase() || "ANALYSE..."}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.item}>
            <MaterialCommunityIcons
              name="lungs"
              size={30}
              color={accentColor}
            />
            <Text style={styles.label}>Respiration</Text>
            <Text style={styles.val}>
              {rpm > 0 ? rpm.toFixed(1) : "--"}
              <Text style={styles.unit}> RPM</Text>
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <MaterialCommunityIcons name="run" size={30} color="#00386A" />
            <Text style={styles.label}>Activité</Text>
            <Text style={styles.val}>{stateLabel || "Repos"}</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginTop: 15 },
  card: {
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  statusHeader: { paddingVertical: 8, alignItems: "center" },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  row: { flexDirection: "row", justifyContent: "space-around", padding: 20 },
  item: { alignItems: "center", flex: 1 },
  label: {
    fontSize: 10,
    color: "#666",
    marginTop: 5,
    textTransform: "uppercase",
  },
  val: { fontSize: 20, fontWeight: "bold", color: "#00386A" },
  unit: { fontSize: 12 },
  divider: { width: 1, height: "100%", backgroundColor: "rgba(0,0,0,0.05)" },
});
