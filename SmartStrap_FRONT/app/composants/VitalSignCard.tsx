import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Type pour les props (facultatif si tu n'utilises pas strictement TS partout)
interface VitalProps {
    label: string;
    value: number | string;
    unit: string;
    icon: any; // Type pour Ionicons
    color: string;
}

const { width } = Dimensions.get("window");

export default function VitalSignCard({ label, value, unit, icon, color }: VitalProps) {
    return (
        <View style={[styles.card, { borderLeftColor: color }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: color + "1A" }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={styles.label}>{label}</Text>
            </View>

            <View style={styles.valueContainer}>
                <Text style={styles.value}>
                    {value || "--"}
                </Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        width: width * 0.43, // Environ 43% de la largeur pour en mettre deux côte à côte
        padding: 15,
        borderRadius: 20,
        borderLeftWidth: 5, // La barre de couleur sur le côté
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 8,
    },
    iconContainer: {
        padding: 6,
        borderRadius: 10,
    },
    label: {
        fontSize: 14,
        fontFamily: "LeagueSpartan_Medium",
        color: "#777",
    },
    valueContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
    },
    value: {
        fontSize: 24,
        fontFamily: "LeagueSpartan_Bold",
        color: "#1A1A1A",
    },
    unit: {
        fontSize: 14,
        fontFamily: "LeagueSpartan_Regular",
        color: "#AAA",
    },
});