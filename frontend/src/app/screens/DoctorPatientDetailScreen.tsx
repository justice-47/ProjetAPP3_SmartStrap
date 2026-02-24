import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
} from "victory-native";
import { API_URL } from "../../../src/config";

const { width } = Dimensions.get("window");

const MOCK_DETAIL_STATS = {
  patient: {
    age: 45,
    poids: 75,
    taille: 178,
    antecedents: "Hypertension légère, fumeur occasionnel.",
  },
  heartRate: [
    { valeur: 75 },
    { valeur: 78 },
    { valeur: 72 },
    { valeur: 80 },
    { valeur: 76 },
    { valeur: 74 },
  ],
  oxygenRate: [
    { valeur: 98 },
    { valeur: 97 },
    { valeur: 99 },
    { valeur: 98 },
    { valeur: 96 },
    { valeur: 98 },
  ],
};

export default function DoctorPatientDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Handle params that might be arrays
  const patientId = Array.isArray(params.patientId)
    ? params.patientId[0]
    : params.patientId;
  const name = Array.isArray(params.name) ? params.name[0] : params.name;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!patientId || Number(patientId) > 1000) {
          // Mock handling
        }

        const response = await fetch(
          `${API_URL}/api/doctor/patient-stats/${patientId}`,
        );
        const data = await response.json();
        if (response.ok && data.patient) {
          setStats(data);
        } else {
          setStats(MOCK_DETAIL_STATS);
        }
      } catch (error) {
        console.error(error);
        setStats(MOCK_DETAIL_STATS);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchStats();
  }, [patientId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Helper to format chart data
  const getGraphData = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0)
      return [{ x: 1, y: 0 }];
    return data.map((d, i) => ({ x: i + 1, y: Number(d.valeur) })).reverse();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Summary */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name ? (name as string).charAt(0) : "P"}
              </Text>
            </View>
            <View>
              <Text style={styles.patientName}>{name}</Text>
              <Text style={styles.patientId}>ID: #{patientId}</Text>
            </View>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => router.push("/screens/chatbot")}
            >
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{stats?.patient?.age} ans</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Poids</Text>
              <Text style={styles.infoValue}>
                {stats?.patient?.poids || "--"} kg
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Taille</Text>
              <Text style={styles.infoValue}>
                {stats?.patient?.taille || "--"} cm
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Sang</Text>
              <Text style={styles.infoValue}>A+</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Antécédents</Text>
          <Text style={styles.bodyText}>
            {stats?.patient?.antecedents || "Aucun antécédent signalé."}
          </Text>
        </View>

        {/* Vitals Charts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fréquence Cardiaque (BPM)</Text>
          <VictoryChart
            width={width - 60}
            height={220}
            theme={VictoryTheme.material}
            padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: "#756f6a" },
                axisLabel: { fontSize: 12, padding: 30 },
                tickLabels: { fontSize: 10, padding: 5 },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#756f6a" },
                tickLabels: { fontSize: 10, padding: 5 },
              }}
            />
            <VictoryLine
              style={{
                data: { stroke: "#ef4444", strokeWidth: 3 },
              }}
              data={getGraphData(stats?.heartRate)}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 },
              }}
            />
          </VictoryChart>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saturation Oxygène (SpO2)</Text>
          <VictoryChart
            width={width - 60}
            height={220}
            theme={VictoryTheme.material}
            padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: "#756f6a" },
                axisLabel: { fontSize: 12, padding: 30 },
                tickLabels: { fontSize: 10, padding: 5 },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#756f6a" },
                tickLabels: { fontSize: 10, padding: 5 },
              }}
            />
            <VictoryLine
              style={{
                data: { stroke: "#3b82f6", strokeWidth: 3 },
              }}
              data={getGraphData(stats?.oxygenRate)}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 },
              }}
            />
          </VictoryChart>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 10 },
  backButtonText: { color: "#3b82f6", fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: { padding: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#3b82f6" },
  patientName: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  patientId: { color: "#6b7280", marginTop: 2 },
  messageButton: {
    marginLeft: "auto",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  messageButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoItem: { alignItems: "center" },
  infoLabel: { color: "#6b7280", fontSize: 12, marginBottom: 4 },
  infoValue: { fontWeight: "bold", fontSize: 16, color: "#111827" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginBottom: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#374151",
  },
  bodyText: { color: "#4b5563", lineHeight: 20 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },
});
