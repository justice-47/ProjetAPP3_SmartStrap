import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
// Assure-toi d'importer exactement cette version
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function AIStatusCard({ rpm, stateLabel } : { rpm: number, stateLabel: string }) {
    return (
        <View style={styles.container}>
            <BlurView intensity={30} tint="light" style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.item}>
                        <MaterialCommunityIcons name="lungs" size={30} color="#00386A" />
                        <Text style={styles.label}>Respiration</Text>
                        <Text style={styles.val}>
                            {rpm ? `${rpm.toFixed(1)}` : "--"} <Text style={styles.unit}>RPM</Text>
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.item}>
                        {/* "run" est l'icône correcte au lieu de "human-run" */}
                        <MaterialCommunityIcons name="run" size={30} color="#00386A" />
                        <Text style={styles.label}>Activité</Text>
                        <Text style={styles.val}>{stateLabel}</Text>
                    </View>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, marginTop: 15 },
    card: { borderRadius: 20, padding: 15, backgroundColor: 'rgba(255,255,255,0.6)', overflow: 'hidden' },
    row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    item: { alignItems: 'center', flex: 1 },
    label: { fontSize: 12, color: '#666', marginTop: 5 },
    val: { fontSize: 20, fontWeight: "bold", color: '#00386A' },
    unit: { fontSize: 12 },
    divider: { width: 1, height: '80%', backgroundColor: 'rgba(0,0,0,0.1)' }
});