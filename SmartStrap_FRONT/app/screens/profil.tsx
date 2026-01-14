// App.js ou votre composant principal
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Navigation from "../composants/navigation";
import WeeklyStatsCard from "../composants/carttest";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [vitals, setVitals] = useState({
    heartRate: "--",
    temperature: "--",
    oxygen: "--",
    respiratoryRate: "--",
  });

  const connectBracelet = () => {
    setIsConnected(true);
    // Simuler des données de santé (remplacer par une vraie connexion)
    setVitals({
      heartRate: "72",
      temperature: "36.6",
      oxygen: "98",
      respiratoryRate: "16",
    });
  };

  const disconnectBracelet = () => {
    setIsConnected(false);
    setVitals({
      heartRate: "--",
      temperature: "--",
      oxygen: "--",
      respiratoryRate: "--",
    });
  };

  const VitalCard = ({
    title,
    value,
    unit,
  }: {
    title: string;
    value: string;
    unit: string;
  }) => (
    <View style={styles.vitalCard}>
      <Text style={styles.vitalTitle}>{title}</Text>
      <View style={styles.vitalValueContainer}>
        <Text style={styles.vitalValue}>{value}</Text>
        <Text style={styles.vitalUnit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* En-tête */}
        <Text style={styles.header}>Connectez votre bracelet</Text>

        {/* Section des constantes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes constantes</Text>

          <View style={styles.vitalsGrid}>
            <VitalCard
              title="Fréquence cardiaque"
              value={vitals.heartRate}
              unit="bpm"
            />
            <VitalCard
              title="Température"
              value={vitals.temperature}
              unit="°C"
            />
            <VitalCard title="Oxygène (SpO2)" value={vitals.oxygen} unit="%" />
            <VitalCard
              title="Fréquence respiratoire"
              value={vitals.respiratoryRate}
              unit="/min"
            />
          </View>

          {/* Ligne de séparation */}
          <View style={styles.divider} />

          {/* Couche des constantes */}
          <View style={styles.constantsLayer}>
            <Text style={styles.constantsLayerText}>Couche des constantes</Text>
            <Text style={styles.constantsLayerSubtext}>
              Surveillance en temps réel des mesures
            </Text>
          </View>
        </View>

        {/* État de connexion */}
        <View style={styles.connectionSection}>
          <View
            style={[
              styles.connectionStatus,
              isConnected ? styles.connected : styles.disconnected,
            ]}
          >
            <View style={styles.connectionIndicator}>
              <View
                style={[
                  styles.indicatorDot,
                  isConnected
                    ? styles.indicatorConnected
                    : styles.indicatorDisconnected,
                ]}
              />
              <Text style={styles.connectionStatusText}>
                {isConnected ? "Bracelet connecté" : "Bracelet non connecté"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.connectButton,
                isConnected
                  ? styles.disconnectButton
                  : styles.connectButtonActive,
              ]}
              onPress={isConnected ? disconnectBracelet : connectBracelet}
            >
              <Text style={styles.connectButtonText}>
                {isConnected ? "Déconnecter" : "Connecter"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Indice de risque respiratoire */}
          <View style={styles.riskIndexContainer}>
            <Text style={styles.riskIndexTitle}>
              Indice de risque respiratoire
            </Text>
            <Text style={styles.riskIndexSubtitle}>
              Précision de l'intelligence artificielle
            </Text>

            {/* Barre de progression (simulée) */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: isConnected ? "85%" : "0%" },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {isConnected ? "85% de précision" : "Non disponible"}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.connectionSection}>
          <View
            style={[
              styles.connectionStatus,
              isConnected ? styles.connected : styles.disconnected,
            ]}
          >
            <View style={styles.connectionIndicator}>
              <View
                style={[
                  styles.indicatorDot,
                  isConnected
                    ? styles.indicatorConnected
                    : styles.indicatorDisconnected,
                ]}
              />
              <Text style={styles.connectionStatusText}>
                {isConnected ? "Bracelet connecté" : "Bracelet non connecté"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.connectButton,
                isConnected
                  ? styles.disconnectButton
                  : styles.connectButtonActive,
              ]}
              onPress={isConnected ? disconnectBracelet : connectBracelet}
            >
              <Text style={styles.connectButtonText}>
                {isConnected ? "Déconnecter" : "Connecter"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Indice de risque respiratoire */}
          <View style={styles.riskIndexContainer}>
            <Text style={styles.riskIndexTitle}>
              Indice de risque respiratoire
            </Text>
            <Text style={styles.riskIndexSubtitle}>
              Précision de l'intelligence artificielle
            </Text>

            {/* Barre de progression (simulée) */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: isConnected ? "85%" : "0%" },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {isConnected ? "85% de précision" : "Non disponible"}
            </Text>
            <WeeklyStatsCard
  heartRateAvg={76}
  spo2Avg={98}
/>
          </View>
        </View>
      </ScrollView>
      <Navigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 30,
    marginTop: 10,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  vitalCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  vitalTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  vitalValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  vitalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2c3e50",
  },
  vitalUnit: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginVertical: 20,
  },
  constantsLayer: {
    alignItems: "center",
  },
  constantsLayerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  constantsLayerSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
  connectionSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  connectionStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  connected: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  disconnected: {
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  connectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  indicatorConnected: {
    backgroundColor: "#4caf50",
  },
  indicatorDisconnected: {
    backgroundColor: "#f44336",
  },
  connectionStatusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  connectButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButtonActive: {
    backgroundColor: "#2196f3",
  },
  disconnectButton: {
    backgroundColor: "#f44336",
  },
  connectButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  riskIndexContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
  },
  riskIndexTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  riskIndexSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
