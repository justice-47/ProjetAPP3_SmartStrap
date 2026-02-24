import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import { Skia } from "@shopify/react-native-skia";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// --- IMPORTS CONFIG & TYPES ---
import { WS_URL, API_URL } from "../../../src/config";
import { WSResponse, HealthData, Diagnosis } from "../../types/health";

// --- IMPORTS COMPOSANTS ---
import Navigation from "../composants/navigation";
import VitalSignCard from "../composants/VitalSignCard";
import PPGChart from "../composants/PPGChart";
import AIStatusCard from "../composants/AIStatusCard";
import Cart from "../composants/cart";
import HeartRateChart from "../composants/HeartRateChart";
import OxygeneRateChart from "../composants/OxygeneRateChart";
import CarouselTabs from "../composants/carrousel";
import WeeklyStatsCard from "../composants/carttest";

const { width } = Dimensions.get("window");
const MAX_POINTS = 100;

export default function Accueil() {
  const router = useRouter();

  // --- ÉTATS ---
  const [status, setStatus] = useState<"connecting" | "online" | "offline">(
    "connecting",
  );
  const [healthData, setHealthData] = useState<HealthData>({
    bpm: 0,
    spo2: 0,
    rpm: 0,
    ir: 0,
    stateLabel: "Initialisation...",
  });
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    status: "Normal",
    message: "",
    severity: "info",
  });

  const [profile, setProfile] = useState({ nom: "", prenom: "" });
  const [heartRateData, setHeartRateData] = useState<{ x: Date; y: number }[]>(
    [],
  );
  const [oxygenData, setOxygenData] = useState<{ x: Date; y: number }[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    heartRateAvg: 0,
    spo2Avg: 0,
  });

  // Valeurs partagées pour l'animation
  const pointsIR = useSharedValue<number[]>(new Array(MAX_POINTS).fill(0));
  const ws = useRef<WebSocket | null>(null);

  // --- 1. WEBSOCKET ---
  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setStatus("online");
      ws.current?.send(
        JSON.stringify({ type: "IDENTIFY", userId: "user_dev_01" }),
      );
    };

    ws.current.onmessage = (e) => {
      try {
        const response: WSResponse = JSON.parse(e.data);
        if (response.type === "SENSOR_DATA") {
          const { healthData: data, diagnosis: diag } = response;

          setHealthData({
            bpm: data.bpm ?? 0,
            spo2: data.spo2 ?? 0,
            rpm: data.rpm ?? 0,
            ir: data.ir ?? 0,
            stateLabel: data.stateLabel ?? "Inconnu",
          });

          if (diag) setDiagnosis(diag);

          // Gestion du buffer circulaire pour le graphique
          const nextPoints = [...pointsIR.value];
          nextPoints.push(data.ir ?? 0);
          if (nextPoints.length > MAX_POINTS) nextPoints.shift();
          pointsIR.value = nextPoints;
        }
      } catch (err) {
        console.error("Erreur parsing WS:", err);
      }
    };

    ws.current.onclose = () => setStatus("offline");
    return () => ws.current?.close();
  }, []);

  // --- 2. API & PROFIL ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedId = await AsyncStorage.getItem("userId");

        // Exécution parallèle des requêtes pour la performance
        const [hrRes, oxyRes, weeklyHrRes, weeklyOxyRes] = await Promise.all([
          fetch(`${API_URL}/api/heart-rate`),
          fetch(`${API_URL}/api/oxygene-rate`),
          fetch(`${API_URL}/api/heart-rate/weekly`),
          fetch(`${API_URL}/api/oxygene-rate/weekly`),
        ]);

        const hrData = await hrRes.json();
        const oxyData = await oxyRes.json();
        const weeklyHrData = await weeklyHrRes.json();
        const weeklyOxyData = await weeklyOxyRes.json();

        setHeartRateData(
          (hrData.heartRateHistory || []).map((item: any) => ({
            x: new Date(item.x),
            y: item.y,
          })),
        );
        setOxygenData(
          (oxyData.oxygenHistory || []).map((item: any) => ({
            x: new Date(item.x),
            y: item.y,
          })),
        );

        setWeeklyStats({
          heartRateAvg: weeklyHrData.weeklyAvgHeartRate || 0,
          spo2Avg: weeklyOxyData.weeklyAvgSpo2 || 0,
        });

        if (storedId) {
          const profRes = await fetch(
            `${API_URL}/api/users/profile/${storedId}`,
          );
          if (profRes.ok) {
            const profData = await profRes.json();
            setProfile({
              nom: profData.nom || "",
              prenom: profData.prenom || "",
            });
          }
        }
      } catch (error) {
        console.error("Erreur chargement API:", error);
      }
    };
    fetchData();
  }, []);

  // --- 3. GRAPHIQUE À ÉCHELLE FIXE (SANS ZOOM AUTO) ---
  const pathIR = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const xStep = (width - 40) / (MAX_POINTS - 1);
    const data = pointsIR.value;

    const graphHeight = 150;
    const padding = 5; // Marge de sécurité haut/bas
    const centerY = graphHeight / 2;

    // --- CONFIGURATION DU ZOOM FIXE ---
    // AJUSTEZ CES VALEURS SELON VOTRE CAPTEUR :

    // 1. Facteur de gain : Détermine l'amplitude verticale des vagues.
    // - Si c'est trop plat, augmentez (ex: 0.05, 0.1).
    // - Si ça sort de l'écran, diminuez (ex: 0.01, 0.005).
    const scaleFactor = 0.02;

    // 2. Offset de base : Valeur brute moyenne attendue pour centrer le signal.
    // Regardez votre "Valeur brute" quand le signal est stable et mettez-la ici.
    const baselineOffset = 2000;

    data.forEach((val, i) => {
      // Calcul de la position Y :
      // On part du centre, et on monte/descend en fonction de la différence
      // avec la baseline, multipliée par le gain.
      // On soustrait car dans le repère écran, Y augmente vers le bas.
      let y = centerY - (val - baselineOffset) * scaleFactor;

      // Clamping : On force la valeur à rester dans les limites graphiques + padding
      // pour éviter que le trait ne sorte vilainement du cadre.
      y = Math.max(padding, Math.min(graphHeight - padding, y));

      if (i === 0) p.moveTo(0, y);
      else p.lineTo(i * xStep, y);
    });
    return p;
  });

  const navigateTo = (path: string) => {
    // @ts-ignore
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.head}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Cart
            style={styles.profileImage}
            images={require("../../../assets/images/photoProfil.jpg")}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.title}>
              {profile.prenom ? `Bonjour ${profile.prenom}` : "SmartStrap"}
            </Text>
            <Text style={styles.subtitle}>Tableau de bord santé</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <TouchableOpacity
            onPress={() => navigateTo("/screens/SettingsScreen")}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateTo("/screens/NotificationsScreen")}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* STATUS BAR */}
      <View
        style={[
          styles.connectionBar,
          { backgroundColor: status === "online" ? "#00FF8815" : "#FF444415" },
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: status === "online" ? "#00FF88" : "#FF4444" },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: status === "online" ? "#008844" : "#CC0000" },
          ]}
        >
          {status === "online" ? "SYSTÈME CONNECTÉ" : "RECONNEXION..."}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1 : VITALES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Temps Réel</Text>
        </View>

        <View style={styles.vitalsRow}>
          <VitalSignCard
            label="Pouls"
            value={healthData.bpm}
            unit="BPM"
            icon="heart"
            color="#FD4755"
            isAlert={
              diagnosis.severity === "critical" &&
              diagnosis.status.includes("Asthme")
            }
          />
          <VitalSignCard
            label="Oxygène"
            value={healthData.spo2}
            unit="%"
            icon="water"
            color="#58a3f8"
            isAlert={healthData.spo2 > 0 && healthData.spo2 < 94}
          />
        </View>

        {/* SECTION 2 : GRAPHIQUE PPG (Échelle Fixe) */}
        <PPGChart pathIR={pathIR} currentIR={healthData.ir} />

        {/* SECTION 3 : IA & DIAGNOSTIC */}
        <AIStatusCard
          rpm={healthData.rpm}
          stateLabel={healthData.stateLabel}
          healthStatus={diagnosis.status}
          severity={diagnosis.severity}
        />

        {/* SECTION 4 : HISTORIQUE */}
        <View style={styles.separator} />
        <Text
          style={[
            styles.sectionTitle,
            { paddingHorizontal: 20, marginBottom: 10 },
          ]}
        >
          Analyses de la semaine
        </Text>

        <CarouselTabs
          data={[1, 2]}
          renderItem={({ item }) => {
            switch (item) {
              case 1:
                return <HeartRateChart data={heartRateData} />;
              case 2:
              default:
                return <OxygeneRateChart data={oxygenData} />;
            }
          }}
        />

        <View style={styles.center}>
          <View style={styles.cart}>
            <View style={{ padding: 20, width: "100%" }}>
              <Text style={styles.cardTitle}>Résumé Hebdomadaire</Text>
              <Text style={styles.cardSubtitle}>
                Moyennes calculées sur 7 jours
              </Text>
              <WeeklyStatsCard
                heartRateAvg={weeklyStats.heartRateAvg}
                spo2Avg={weeklyStats.spo2Avg}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <Navigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F3" },
  scrollContent: { paddingBottom: 100 },

  // Header
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F6F6F3",
  },
  profileImage: { height: 50, width: 50, borderRadius: 25, overflow: "hidden" },
  title: { fontSize: 18, fontFamily: "LeagueSpartan_Bold", color: "#1A1A1A" },
  subtitle: {
    fontSize: 12,
    fontFamily: "LeagueSpartan_Regular",
    color: "#666",
  },

  // Status
  connectionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginBottom: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },

  // Titres
  sectionHeader: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "LeagueSpartan_Bold",
    color: "#1A1A1A",
  },

  // Layouts
  vitalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    width: "80%",
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginVertical: 25,
  },
  center: { alignItems: "center", marginTop: 10 },
  cart: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "LeagueSpartan_Medium",
    color: "black",
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: "LeagueSpartan_Regular",
    color: "#666",
    marginBottom: 15,
  },
});
