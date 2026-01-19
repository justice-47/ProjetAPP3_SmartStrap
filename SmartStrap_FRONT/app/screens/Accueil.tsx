import { ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import { Skia } from "@shopify/react-native-skia";

// Tes imports de configuration et composants
import { WS_URL } from "../../src/config";
import Navigation from "../composants/navigation";
import HealthInsights from "../composants/HealthInsights";

// --- NOUVEAUX COMPOSANTS RÉUNIS ---
import PPGChart from "../composants/PPGChart";
import AIStatusCard from "../composants/AIStatusCard";
import VitalSignCard from "../composants/VitalSignCard";

const { width } = Dimensions.get("window");
const MAX_POINTS = 100;

export default function Accueil() {
  const [status, setStatus] = useState("🔴 Déconnecté");
  const [healthData, setHealthData] = useState({
    bpm: 0,
    spo2: 0,
    rpm: 0,
    stateLabel: "Analyse...",
    ir: 0
  });

  // Valeur partagée pour le graphique Skia (Performance)
  const pointsIR = useSharedValue<number[]>(new Array(MAX_POINTS).fill(0));

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (e) => {
      try {
        const response = JSON.parse(e.data);
        if (response.type === 'SENSOR_DATA') {
          const { healthData: data } = response;

          // 1. Mise à jour des états textes
          setHealthData({
            bpm: Math.round(data.bpm),
            spo2: data.spo2,
            rpm: data.rpm,
            stateLabel: data.stateLabel,
            ir: data.ir
          });

          // 2. Mise à jour du flux pour le graphique Skia
          const nextIR = [...pointsIR.value];
          nextIR.push(data.ir);
          if (nextIR.length > MAX_POINTS) nextIR.shift();
          pointsIR.value = nextIR;
        }
      } catch (err) { console.error("WS Error:", err); }
    };

    ws.onopen = () => setStatus("🟢 Live");
    ws.onclose = () => setStatus("🔴 Déconnecté");
    return () => ws.close();
  }, []);

  // Génération du chemin du signal PPG
  const pathIR = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const xStep = (width - 40) / (MAX_POINTS - 1);
    pointsIR.value.forEach((val, i) => {
      // On ajuste l'échelle pour que le signal soit visible (centré sur 150px de haut)
      const y = 75 - (val * 0.05);
      if (i === 0) p.moveTo(0, y);
      else p.lineTo(i * xStep, y);
    });
    return p;
  });

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Header & Status */}
          <View style={styles.header}>
            <Text style={styles.welcome}>Tableau de Bord</Text>
            <Text style={[styles.status, { color: status.includes("🟢") ? '#00FF88' : '#FF4444' }]}>
              {status}
            </Text>
          </View>

          {/* SECTION 1 : Les Constantes (Cardiaque & Oxygène) */}
          <View style={styles.vitalsRow}>
            <VitalSignCard label="Pouls" value={healthData.bpm} unit="BPM" icon="heart" color="#FD4755" />
            <VitalSignCard label="Oxygène" value={healthData.spo2} unit="%" icon="water" color="#58a3f8" />
          </View>

          {/* SECTION 2 : Le Graphique Temps Réel (PPG) */}
          <PPGChart pathIR={pathIR} currentIR={healthData.ir} />

          {/* SECTION 3 : Prédictions IA (Respiration & Activité) */}
          <AIStatusCard rpm={healthData.rpm} stateLabel={healthData.stateLabel} />

          {/* SECTION 4 : Analyse de santé automatique */}
          <HealthInsights bpm={healthData.bpm} rpm={healthData.rpm} />

        </ScrollView>

        <Navigation />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F3" },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome: { fontSize: 24, fontFamily: "LeagueSpartan_Bold", color: "#1A1A1A" },
  status: { fontSize: 14, fontWeight: 'bold' },
  vitalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
});