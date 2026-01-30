import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VitalProps {
  label: string;
  value: number | string | null;
  unit: string;
  icon: keyof typeof Ionicons.prototype.props.name;
  color: string;
  isAlert?: boolean;
}

export default function VitalSignCard({
  label,
  value,
  unit,
  icon,
  color,
  isAlert,
}: VitalProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAlert) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      opacity.setValue(1);
    }
  }, [isAlert]);

  const activeColor = isAlert ? "#FF4444" : color;

  return (
    <Animated.View
      style={[styles.card, { borderLeftColor: activeColor, opacity }]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: activeColor + "1A" },
          ]}
        >
          <Ionicons name={icon as any} size={20} color={activeColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, isAlert && { color: "#FF4444" }]}>
          {value !== null && value !== 0 ? value : "--"}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    width: Dimensions.get("window").width * 0.43,
    padding: 15,
    borderRadius: 20,
    borderLeftWidth: 5,
    elevation: 3,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconContainer: { padding: 6, borderRadius: 10, marginRight: 8 },
  label: { fontSize: 12, color: "#777", fontWeight: "600" },
  valueContainer: { flexDirection: "row", alignItems: "baseline" },
  value: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },
  unit: { fontSize: 12, color: "#AAA", marginLeft: 4 },
});
