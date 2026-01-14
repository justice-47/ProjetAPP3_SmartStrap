import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
}

const ProgressBar = ({ value, max, color }: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View style={styles.progressContainer}>
      <View
        style={[
          styles.progressFill,
          { width: `${percentage}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
};

interface WeeklyStatsCardProps {
  heartRateAvg?: number;
  spo2Avg?: number;
}

export default function WeeklyStatsCard({
  heartRateAvg = 77,
  spo2Avg = 84,
}: WeeklyStatsCardProps) {
  return (
    <View style={styles.card}>
      {/* Fréquence cardiaque */}
      <View style={styles.row}>
        <Text style={styles.label}>Fréquence cardiaque moyenne</Text>
        <FontAwesome5 name="heartbeat" size={16} color="#E63946" />
      </View>
      <Text style={styles.value}>{heartRateAvg} BPM</Text>
      <ProgressBar value={heartRateAvg} max={200} color="#ff0000ff" />

      {/* SpO2 */}
      <View style={[styles.row, { marginTop: 16 }]}>
        <Text style={styles.label}>SpO₂</Text>
        <Text style={styles.spo2Icon}>O₂</Text>
      </View>
      <Text style={styles.value}>{spo2Avg}%</Text>
      <ProgressBar value={spo2Avg} max={100} color="#4a7effff" />
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    fontFamily: "LeagueSpartan_Bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#777",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    fontFamily: "LeagueSpartan_Medium",
  },
  value: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  progressContainer: {
    height: 8,
    width: "100%",
    backgroundColor: "#EAEAEA",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  spo2Icon: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4a7effff",
  },
});
