import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// --- MOCK DATA ---
const MOCK_PATIENTS = [
  {
    patient_id: 101,
    prenom: "Lucas",
    nom: "Bernard",
    age: 45,
    genre: "Homme",
    val: 1,
  },
  {
    patient_id: 102,
    prenom: "Emma",
    nom: "Durand",
    age: 32,
    genre: "Femme",
    val: 2,
  },
  {
    patient_id: 103,
    prenom: "Léa",
    nom: "Petit",
    age: 28,
    genre: "Femme",
    val: 3,
  },
  {
    patient_id: 104,
    prenom: "Thomas",
    nom: "Moreau",
    age: 56,
    genre: "Homme",
    val: 4,
  },
];

const MOCK_STATS = {
  patientCount: 12,
  alertCount: 3,
  recentAlerts: [
    {
      id: 901,
      title: "SpO2 Basse",
      message: "Patient Lucas Bernard à 88%",
      created_at: new Date().toISOString(),
      prenom: "Lucas",
      nom: "Bernard",
    },
    {
      id: 902,
      title: "Arythmie",
      message: "Fréquence instable détectée",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      prenom: "Emma",
      nom: "Durand",
    },
  ],
};

// --- SUBCOMPONENTS ---

const KpiCard = ({ title, value, subtitle, icon, isAlert }: any) => (
  <View style={[styles.kpiCard, isAlert && styles.kpiCardAlert]}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <View
        style={[
          styles.iconContainer,
          isAlert && { backgroundColor: "#fee2e2" },
        ]}
      >
        <Text style={styles.kpiIcon}>{icon}</Text>
      </View>
    </View>
    <Text style={[styles.kpiValue, isAlert && { color: "#dc2626" }]}>
      {value}
    </Text>
    <Text style={[styles.kpiSubtitle, isAlert && { color: "#ef4444" }]}>
      {subtitle}
    </Text>
  </View>
);

const AlertItem = ({
  name,
  tag,
  message,
  time,
  isCritical,
  isWarning,
}: any) => (
  <View
    style={[
      styles.alertItem,
      isCritical && { borderLeftColor: "#dc2626" },
      isWarning && { borderLeftColor: "#f59e0b" },
    ]}
  >
    <View style={styles.alertHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Text style={styles.alertName}>{name}</Text>
        <View
          style={[
            styles.tag,
            isCritical
              ? { backgroundColor: "#fee2e2" }
              : { backgroundColor: "#fef3c7" },
          ]}
        >
          <Text
            style={[
              styles.tagText,
              isCritical ? { color: "#991b1b" } : { color: "#92400e" },
            ]}
          >
            {tag}
          </Text>
        </View>
      </View>
      <Text style={styles.alertTime}>{time}</Text>
    </View>
    <Text style={styles.alertMessage} numberOfLines={2}>
      {message}
    </Text>

    <TouchableOpacity style={styles.alertAction}>
      <Text style={styles.alertActionText}>Voir le dossier</Text>
    </TouchableOpacity>
  </View>
);

const PatientAttentionCard = ({
  patientId,
  name,
  initials,
  status,
  metrics,
  isCritical,
}: any) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.patientCard, isCritical && styles.criticalBorder]}
      onPress={() =>
        router.push({
          pathname: "/screens/DoctorPatientDetailScreen",
          params: { patientId: patientId, name: name },
        })
      }
    >
      <View style={styles.patientHeader}>
        <View
          style={[
            styles.initials,
            isCritical
              ? { backgroundColor: "#fee2e2" }
              : { backgroundColor: "#dbeafe" },
          ]}
        >
          <Text
            style={[
              styles.initialsText,
              isCritical ? { color: "#dc2626" } : { color: "#1e40af" },
            ]}
          >
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.patientId}>ID: #{patientId}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsContainer}>
        {metrics.map((m: any, i: number) => (
          <View key={i} style={styles.metricRow}>
            <Text style={styles.metricLabel}>{m.l}</Text>
            <Text style={styles.metricValue}>{m.v}</Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.statusBadge,
          isCritical
            ? { backgroundColor: "#fecaca" }
            : { backgroundColor: "#d1fae5" },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            isCritical ? { color: "#991b1b" } : { color: "#065f46" },
          ]}
        >
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- MAIN COMPONENT ---

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    patientCount: 0,
    alertCount: 0,
    recentAlerts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("userName");

        if (name) setDoctorName(name);

        // API Calls
        if (userId) {
          try {
            const response = await fetch(
              `${API_URL}/api/doctor/patients/${userId}`,
            );
            const data = await response.json();
            if (response.ok && Array.isArray(data) && data.length > 0) {
              setPatients(data);
            } else {
              setPatients(MOCK_PATIENTS); // Fallback to mock
            }

            const statsResponse = await fetch(
              `${API_URL}/api/doctor/dashboard-stats/${userId}`,
            );
            const statsData = await statsResponse.json();
            if (statsResponse.ok && statsData.patientCount > 0) {
              setStats(statsData);
            } else {
              setStats(MOCK_STATS); // Fallback to mock
            }
          } catch (e) {
            console.log("Network error, using mock data");
            setPatients(MOCK_PATIENTS);
            setStats(MOCK_STATS);
          }
        } else {
          // No User ID (Dev mode maybe?)
          setPatients(MOCK_PATIENTS);
          setStats(MOCK_STATS);
        }
      } catch (error) {
        console.error("Erreur fetchDashboardData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>VitalCare</Text>
            <Text style={styles.appTagline}>Espace Médecin</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Bracelet button removed as requested */}
            <View style={styles.profileContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {doctorName ? doctorName.charAt(0).toUpperCase() : "M"}
                </Text>
              </View>
              <View>
                <Text style={styles.userName}>
                  {doctorName || "Dr. Leblanc"}
                </Text>
                <Text style={styles.userRole}>Cardiologue</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutEmoji}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.greeting}>
            Bonjour, Dr. {doctorName || "Leblanc"}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
        </View>

        {/* KPIS */}
        <View style={styles.kpiContainer}>
          <KpiCard
            title="Total Patients"
            value={stats.patientCount || patients.length}
            subtitle="+2 cette semaine"
            icon="👥"
          />
          <KpiCard
            title="Alertes"
            value={stats.alertCount}
            subtitle="Nécessite attention"
            icon="⚠️"
            isAlert={stats.alertCount > 0}
          />
          <KpiCard
            title="RDV Jour"
            value="4"
            subtitle="Prochain à 14h00"
            icon="📅"
          />
          <KpiCard title="Messages" value="8" subtitle="3 nouveaux" icon="💬" />
        </View>

        {/* Recent Alerts Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Alertes Récentes</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {stats.recentAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune alerte à signaler ✅
              </Text>
            </View>
          ) : (
            stats.recentAlerts.map((alert: any) => (
              <AlertItem
                key={alert.id}
                name={`${alert.prenom} ${alert.nom}`}
                tag={alert.title}
                message={alert.message}
                time={new Date(alert.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                isCritical={true} // For demo/mock purposes usually critical in this list
              />
            ))
          )}
        </View>

        {/* Urgent Patients Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Mes Patients</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Voir l'annuaire</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={{ padding: 20, color: "#6b7280" }}>
              Chargement des données...
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {patients.map((patient, index) => (
                <PatientAttentionCard
                  key={index}
                  patientId={patient.patient_id || patient.id}
                  name={`${patient.prenom} ${patient.nom}`}
                  initials={`${patient.prenom[0]}${patient.nom[0]}`}
                  status={index % 3 === 0 ? "Critique" : "Stable"}
                  isCritical={index % 3 === 0}
                  metrics={[
                    { l: "Age", v: `${patient.age} ans` },
                    { l: "Poids", v: "75 kg" }, // Mock if missing
                  ]}
                />
              ))}

              <TouchableOpacity style={styles.addPatientCard}>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addText}>Ajouter</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { paddingBottom: 40 },

  header: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  appName: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  appTagline: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  avatarText: { color: "#2563eb", fontWeight: "bold", fontSize: 14 },
  userName: { fontWeight: "700", fontSize: 13, color: "#1e293b" },
  userRole: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  logoutButton: { padding: 5 },
  logoutEmoji: { fontSize: 18 },

  sectionHeader: { padding: 20, paddingBottom: 10 },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    textTransform: "capitalize",
  },

  kpiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kpiCard: {
    width: width / 2 - 24,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#64748b",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  kpiCardAlert: {
    backgroundColor: "#fff",
    borderColor: "#fee2e2",
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  iconContainer: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
  kpiTitle: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  kpiIcon: { fontSize: 16 },
  kpiValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  kpiSubtitle: { fontSize: 11, color: "#10b981", fontWeight: "600" },

  sectionContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  linkText: { color: "#2563eb", fontWeight: "600", fontSize: 13 },

  // Alert Item
  alertItem: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#cbd5e1",
    shadowColor: "#64748b",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  alertName: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1e293b",
    marginRight: 8,
  },
  alertTime: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: "700" },
  alertMessage: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 12,
  },
  alertAction: { alignSelf: "flex-start" },
  alertActionText: { fontSize: 12, color: "#2563eb", fontWeight: "600" },

  emptyState: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyStateText: { color: "#64748b" },

  // Horizontal Scroll
  horizontalScroll: { paddingRight: 20 },
  patientCard: {
    width: 200,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
    shadowColor: "#64748b",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  criticalBorder: {
    borderColor: "#fecaca",
    backgroundColor: "#fff",
  },
  patientHeader: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  initials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  initialsText: { fontWeight: "700", fontSize: 16 },
  patientName: { fontWeight: "700", fontSize: 15, color: "#1e293b" },
  patientId: { fontSize: 11, color: "#64748b" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 12 },

  metricsContainer: { marginBottom: 16 },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metricLabel: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  metricValue: { fontSize: 12, fontWeight: "700", color: "#334155" },

  statusBadge: {
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: { fontSize: 11, fontWeight: "700" },

  addPatientCard: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  addIcon: { fontSize: 24, color: "#94a3b8", marginBottom: 5 },
  addText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
});
