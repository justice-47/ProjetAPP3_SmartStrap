import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function DoctorDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>VitalCare</Text>
            <Text style={styles.appTagline}>
              Surveillance respiratoire intelligente
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.braceletButton}>
              <Text style={styles.braceletButtonText}>⚡ Bracelet</Text>
            </TouchableOpacity>
            <View style={styles.profileContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>G</Text>
              </View>
              <View>
                <Text style={styles.userName}>gnazaleyann07</Text>
                <Text style={styles.userRole}>Doctor</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navbar (Visual Only) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.navbar}
        >
          {[
            "Tableau de bord",
            "Paramètres vitaux",
            "Historique",
            "Assistant santé",
            "Profil",
            "Patients",
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.navItem, index === 0 && styles.navItemActive]}
            >
              <Text
                style={[styles.navText, index === 0 && styles.navTextActive]}
              >
                {item}
              </Text>
              {index === 0 && <View style={styles.activeBar} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dashboard Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.pageTitle}>Tableau de bord médecin</Text>
          <Text style={styles.pageSubtitle}>
            Bienvenue Dr. gnazaleyann07 - Vue d'ensemble de votre pratique
          </Text>
        </View>

        {/* Critical Alert Banner */}
        <View style={styles.criticalBanner}>
          <Text style={styles.criticalTitle}>
            ⚠️ 2 patients en état critique
          </Text>
          <Text style={styles.criticalSubtitle}>
            Intervention urgente recommandée. Consultez la section alertes
            ci-dessous.
          </Text>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <KpiCard
            title="Patients suivis"
            value="24"
            subtitle="↗ +3 ce mois"
            icon="👥"
          />
          <KpiCard
            title="Alertes actives"
            value="7"
            subtitle="2 critiques"
            icon="⚠️"
            isAlert
          />
          <KpiCard
            title="RDV aujourd'hui"
            value="6"
            subtitle="2 à venir"
            icon="📅"
          />
          <KpiCard
            title="Messages non lus"
            value="12"
            subtitle="De 8 patients"
            icon="💬"
          />
        </View>

        {/* Main Content Area */}
        <View style={styles.mainGrid}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Recent Alerts */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Alertes récentes</Text>
                  <Text style={styles.cardSubtitle}>
                    Anomalies détectées par le système IA
                  </Text>
                </View>
                <TouchableOpacity style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Tout voir</Text>
                </TouchableOpacity>
              </View>

              <AlertItem
                name="Pierre Lefebvre"
                tag="SpO2"
                message="SpO2 critique : 88%"
                time="Il y a 5 min"
                isCritical
              />
              <AlertItem
                name="Marie Martin"
                tag="BPM"
                message="Fréquence cardiaque élevée : 105 BPM"
                time="Il y a 15 min"
                isWarning
              />
              <AlertItem
                name="Marie Martin"
                tag="Température"
                message="Température légèrement élevée : 37.8°C"
                time="Il y a 20 min"
                isWarning
              />
              <AlertItem
                name="Pierre Lefebvre"
                tag="Respiration"
                message="Fréquence respiratoire anormale : 28/min"
                time="Il y a 30 min"
                isCritical
              />
            </View>

            {/* Weekly Activity Chart (Mock) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Activité de la semaine</Text>
              <Text style={styles.cardSubtitle}>Consultations et alertes</Text>
              <View style={styles.chartPlaceholder}>
                {/* Simple CSS Bar Chart Mockup */}
                {[8, 6, 9, 7, 10, 5, 2].map((h, i) => (
                  <View key={i} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: h * 15,
                          backgroundColor: i % 2 === 0 ? "#3b82f6" : "#f59e0b",
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>
                      {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Patient Status Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>État des patients</Text>
              <Text style={styles.cardSubtitle}>
                Répartition par niveau de risque
              </Text>
              <View style={styles.donutContainer}>
                {/* Simple Circle Representation */}
                <View style={styles.donutChart}>
                  <View
                    style={[
                      styles.slice,
                      {
                        borderTopColor: "#10b981",
                        borderRightColor: "#10b981",
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.slice,
                      {
                        borderBottomColor: "#f59e0b",
                        transform: [{ rotate: "45deg" }],
                      },
                    ]}
                  />
                  <View style={styles.donutHole} />
                </View>
                <View style={styles.legendContainer}>
                  <LegendItem color="#10b981" label="Normal" value="17" />
                  <LegendItem color="#f59e0b" label="Surveillance" value="5" />
                  <LegendItem color="#ef4444" label="Critique" value="2" />
                </View>
              </View>
            </View>

            {/* Agenda */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Agenda du jour</Text>
              <Text style={styles.cardSubtitle}>mercredi 14 janvier</Text>

              <AgendaItem
                time="09:00"
                name="Jean Dupont"
                type="Consultation de suivi"
                status="Terminé"
              />
              <AgendaItem
                time="10:30"
                name="Sophie Bernard"
                type="Bilan respiratoire"
                status="Terminé"
              />
              <AgendaItem
                time="14:00"
                name="Marie Martin"
                type="Consultation urgente"
                status="En cours"
                isBlue
              />
              <AgendaItem
                time="15:30"
                name="Pierre Lefebvre"
                type="Suivi post-traitement"
                status="À venir"
                isGray
              />
            </View>
          </View>
        </View>

        {/* Urgent Patients Section */}
        <View style={styles.fullWidthCard}>
          <Text style={styles.cardTitle}>
            Patients nécessitant une attention
          </Text>
          <Text style={styles.cardSubtitle}>
            Anomalies détectées dans les dernières 24h
          </Text>

          <View style={styles.horizontalScroll}>
            <PatientAttentionCard
              name="Pierre Lefebvre"
              initials="PL"
              status="Critique"
              metrics={[
                { l: "SpO2", v: "88%", c: "red" },
                { l: "Resp", v: "28/min", c: "red" },
                { l: "BPM", v: "110", c: "orange" },
              ]}
              isCritical
            />

            <PatientAttentionCard
              name="Marie Martin"
              initials="MM"
              status="Surveillance"
              metrics={[
                { l: "BPM", v: "105", c: "orange" },
                { l: "Temp", v: "37.8°C", c: "orange" },
                { l: "SpO2", v: "92%", c: "green" },
              ]}
            />

            <View style={styles.stableCard}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.stableTitle}>Autres patients stables</Text>
              <Text style={styles.stableSubtitle}>
                17 patients en état normal
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Subcomponents
const KpiCard = ({ title, value, subtitle, icon, isAlert }: any) => (
  <View style={[styles.kpiCard, isAlert && styles.kpiCardAlert]}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={styles.kpiIcon}>{icon}</Text>
    </View>
    <Text style={[styles.kpiValue, isAlert && { color: "#dc2626" }]}>
      {value}
    </Text>
    <Text style={styles.kpiSubtitle}>{subtitle}</Text>
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
      isCritical && { backgroundColor: "#fef2f2" },
      isWarning && { backgroundColor: "#fffbeb" },
    ]}
  >
    <View style={styles.alertHeader}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {isCritical && <Text style={{ marginRight: 5 }}>⚠️</Text>}
        {isWarning && <Text style={{ marginRight: 5 }}>⚠️</Text>}
        <Text style={styles.alertName}>{name}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.contactButton}>
        <Text style={styles.contactButtonText}>📞 Contacter</Text>
      </TouchableOpacity>
    </View>
    <Text style={[styles.alertMessage, isCritical && { color: "#dc2626" }]}>
      {message}
    </Text>
    <Text style={styles.alertTime}>{time}</Text>
  </View>
);

const LegendItem = ({ color, label, value }: any) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
    <Text style={styles.legendValue}>{value}</Text>
  </View>
);

const AgendaItem = ({ time, name, type, status, isBlue, isGray }: any) => (
  <View style={styles.agendaItem}>
    <Text style={styles.agendaTime}>{time}</Text>
    <View style={styles.agendaContent}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.agendaName}>{name}</Text>
        <View
          style={[
            styles.statusBadge,
            isBlue && { backgroundColor: "#dbeafe" },
            isGray && { backgroundColor: "#f3f4f6" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isBlue && { color: "#1d4ed8" },
              isGray && { color: "#4b5563" },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
      <Text style={styles.agendaType}>{type}</Text>
    </View>
  </View>
);

const PatientAttentionCard = ({
  name,
  initials,
  status,
  metrics,
  isCritical,
}: any) => (
  <View style={[styles.patientCard, isCritical && { borderColor: "#fca5a5" }]}>
    <View style={styles.patientHeader}>
      <View
        style={[
          styles.initials,
          isCritical
            ? { backgroundColor: "#fee2e2" }
            : { backgroundColor: "#ffedd5" },
        ]}
      >
        <Text
          style={[
            styles.initialsText,
            isCritical ? { color: "#dc2626" } : { color: "#c2410c" },
          ]}
        >
          {initials}
        </Text>
      </View>
      <View>
        <Text style={styles.patientName}>{name}</Text>
        <View
          style={[
            styles.statusTag,
            isCritical
              ? { backgroundColor: "#fee2e2" }
              : { backgroundColor: "#ffedd5" },
          ]}
        >
          <Text
            style={[
              styles.statusTagText,
              isCritical ? { color: "#dc2626" } : { color: "#c2410c" },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.metricsContainer}>
      {metrics.map((m: any, i: number) => (
        <View key={i} style={styles.metricRow}>
          <Text style={styles.metricLabel}>{m.l}</Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.metricValue}>{m.v}</Text>
            <Text style={{ marginLeft: 5 }}>⚠️</Text>
          </View>
        </View>
      ))}
    </View>

    {isCritical ? (
      <TouchableOpacity style={styles.urgentButton}>
        <Text style={styles.urgentButtonText}>Intervention urgente</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.contactButtonOutline}>
        <Text style={styles.contactOutlineText}>Contacter le patient</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { paddingBottom: 40 },
  header: {
    backgroundColor: "#FFF",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  appName: { fontSize: 20, fontWeight: "bold", color: "#3b82f6" },
  appTagline: { fontSize: 12, color: "#6b7280" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  braceletButton: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 20,
    marginRight: 15,
  },
  braceletButtonText: { fontWeight: "600" },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: { color: "#FFF", fontWeight: "bold" },
  userName: { fontWeight: "bold", fontSize: 14 },
  userRole: { fontSize: 12, color: "#6b7280" },
  logoutText: { color: "#6b7280", fontSize: 12 },

  navbar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  navItem: { marginRight: 25, paddingVertical: 15 },
  navItemActive: {},
  navText: { color: "#6b7280", fontSize: 15 },
  navTextActive: { color: "#3b82f6", fontWeight: "bold" },
  activeBar: {
    height: 3,
    backgroundColor: "#3b82f6",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  sectionHeader: { padding: 20 },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  pageSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 5 },

  criticalBanner: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 20,
  },
  criticalTitle: { color: "#991b1b", fontWeight: "bold", fontSize: 16 },
  criticalSubtitle: { color: "#b91c1c", marginTop: 5 },

  kpiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  kpiCard: {
    width: width / 2 - 25,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  kpiCardAlert: {},
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kpiTitle: { color: "#6b7280", fontSize: 13 },
  kpiIcon: { fontSize: 18 },
  kpiValue: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  kpiSubtitle: { fontSize: 12, color: "#10b981", marginTop: 5 },

  mainGrid: { paddingHorizontal: 20 },
  leftColumn: { marginBottom: 20 },
  rightColumn: {},

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  cardSubtitle: { fontSize: 13, color: "#6b7280", marginBottom: 15 },
  smallButton: { padding: 5, backgroundColor: "#f3f4f6", borderRadius: 6 },
  smallButtonText: { fontSize: 12 },

  alertItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertName: { fontWeight: "bold", fontSize: 14 },
  tag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  tagText: { fontSize: 10, fontWeight: "bold" },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  contactButtonText: { fontSize: 12 },
  alertMessage: { marginTop: 8, fontSize: 13, color: "#374151" },
  alertTime: { fontSize: 11, color: "#9ca3af", marginTop: 4 },

  chartPlaceholder: {
    height: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: 20,
  },
  barContainer: { alignItems: "center" },
  bar: { width: 15, borderRadius: 4, minHeight: 10 },
  barLabel: { fontSize: 10, color: "#6b7280", marginTop: 5 },

  donutContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  donutChart: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 15,
    borderColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  slice: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 15,
    borderColor: "transparent",
  },
  donutHole: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
  },
  legendContainer: { marginLeft: 15 },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendLabel: { fontSize: 12, color: "#6b7280", flex: 1 },
  legendValue: { fontWeight: "bold", fontSize: 12 },

  agendaItem: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  agendaTime: { width: 50, fontSize: 13, fontWeight: "bold", color: "#4b5563" },
  agendaContent: { flex: 1 },
  agendaName: { fontWeight: "bold", fontSize: 14, color: "#1f2937" },
  agendaType: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#dcfce7",
  },
  statusText: { fontSize: 10, color: "#166534", fontWeight: "bold" },

  fullWidthCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  horizontalScroll: { flexDirection: "row", marginTop: 15 },
  patientCard: {
    width: 220,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fdba74",
    marginRight: 15,
    backgroundColor: "#fff7ed",
  },
  patientHeader: { flexDirection: "row", marginBottom: 15 },
  initials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  initialsText: { fontWeight: "bold", fontSize: 16 },
  patientName: { fontWeight: "bold", fontSize: 14 },
  statusTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  statusTagText: { fontSize: 10, fontWeight: "bold" },
  metricsContainer: { marginBottom: 15 },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  metricLabel: { fontSize: 12, color: "#6b7280" },
  metricValue: { fontSize: 12, fontWeight: "bold", color: "#c2410c" },

  urgentButton: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  urgentButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  contactButtonOutline: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  contactOutlineText: { color: "#374151", fontSize: 12, fontWeight: "bold" },

  stableCard: {
    width: 220,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
  },
  checkCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  checkIcon: { fontSize: 24, color: "#166534" },
  stableTitle: { fontWeight: "bold", color: "#4b5563" },
  stableSubtitle: { fontSize: 12, color: "#9ca3af", marginTop: 5 },
});
