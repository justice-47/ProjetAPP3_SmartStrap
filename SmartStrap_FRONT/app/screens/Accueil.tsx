import { ScrollView, StyleSheet, Text, View, StatusBar, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../composants/navigation";
import Cart from "../composants/cart";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useState, useEffect } from "react";
import MaterialDesignIcons from "@expo/vector-icons/MaterialCommunityIcons";
import HeartRateChart from "../composants/HeartRateChart";
import CarouselTabs from "../composants/carrousel";
import WeeklyStatsCard from "../composants/carttest";
import OxygeneRateChart from "../composants/OxygeneRateChart";
import { API_URL, WS_URL } from "../../src/config";
import { Canvas, Path, Skia, Line, SkPath } from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import HealthInsights from "../composants/HealthInsights";

const { width } = Dimensions.get("window");
const MAX_POINTS = 100;
const GRAPH_HEIGHT = 200;
const AMPLITUDE = 1000;

export default function Accueil() {
  const [status, setStatus] = useState<string>("🔴");
  const [fréquenceCardiaque, setFréquenceCardiaque] = useState<number | null>(null);
  const [oxygene, setOxygene] = useState<number | null>(null);
  const [currentSignals, setCurrentSignals] = useState({ ir: 0, red: 0 });

  const [heartRateData, setHeartRateData] = useState<{ x: Date; y: number }[]>([]);
  const [oxygenData, setOxygenData] = useState<{ x: Date; y: number }[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    heartRateAvg: 0,
    spo2Avg: 0,
  });

  const [profile, setProfile] = useState({
    nom: "",
    prenom: "",
  });

  const pointsIR = useSharedValue<number[]>(new Array(MAX_POINTS).fill(0));
  const pointsRed = useSharedValue<number[]>(new Array(MAX_POINTS).fill(0));

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setFréquenceCardiaque(Math.round(parseFloat(data.bpm)));
        setOxygene(parseInt(data.spo2));
        setCurrentSignals({
          ir: parseFloat(data.ir),
          red: parseFloat(data.red),
        });

        const nextIR = [...pointsIR.value];
        nextIR.push(parseFloat(data.ir));
        if (nextIR.length > MAX_POINTS) nextIR.shift();
        pointsIR.value = nextIR;

        const nextRed = [...pointsRed.value];
        nextRed.push(parseFloat(data.red));
        if (nextRed.length > MAX_POINTS) nextRed.shift();
        pointsRed.value = nextRed;
      } catch (err) {
        console.error("Parsing error:", err);
      }
    };

    ws.onopen = () => setStatus("🟢 Live");
    ws.onclose = () => setStatus("🔴 Déconnecté");

    const fetchData = async () => {
      try {
        const [hrRes, oxyRes, weeklyHrRes, weeklyOxyRes, storedId] = await Promise.all([
          fetch(`${API_URL}/api/heart-rate`),
          fetch(`${API_URL}/api/oxygene-rate`),
          fetch(`${API_URL}/api/heart-rate/weekly`),
          fetch(`${API_URL}/api/oxygene-rate/weekly`),
          AsyncStorage.getItem("userId")
        ]);

        const hrData = await hrRes.json();
        const oxyData = await oxyRes.json();
        const weeklyHrData = await weeklyHrRes.json();
        const weeklyOxyData = await weeklyOxyRes.json();

        setHeartRateData((hrData.heartRateHistory || []).map((item: any) => ({ x: new Date(item.x), y: item.y })));
        setOxygenData((oxyData.oxygenHistory || []).map((item: any) => ({ x: new Date(item.x), y: item.y })));
        setWeeklyStats({
          heartRateAvg: weeklyHrData.weeklyAvgHeartRate,
          spo2Avg: weeklyOxyData.weeklyAvgSpo2,
        });

        if (storedId) {
          const profRes = await fetch(`${API_URL}/api/users/profile/${storedId}`);
          const profData = await profRes.json();
          if (profRes.ok) {
            setProfile({ nom: profData.nom || "", prenom: profData.prenom || "" });
          }
        }
      } catch (error) {
        console.error("Erreur chargement données:", error);
      }
    };

    fetchData();
    return () => ws.close();
  }, [pointsIR, pointsRed]);

  const pathIR = useDerivedValue<SkPath>(() => {
    if (typeof Skia === 'undefined' || !Skia.Path) return null as any;
    const p = Skia.Path.Make();
    const xStep = (width - 40) / (MAX_POINTS - 1);
    pointsIR.value.forEach((val, i) => {
      const y = GRAPH_HEIGHT / 2 - val * (GRAPH_HEIGHT / AMPLITUDE);
      if (i === 0) p.moveTo(0, y);
      else p.lineTo(i * xStep, y);
    });
    return p;
  });

  const pathRed = useDerivedValue<SkPath>(() => {
    if (typeof Skia === 'undefined' || !Skia.Path) return null as any;
    const p = Skia.Path.Make();
    const xStep = (width - 40) / (MAX_POINTS - 1);
    pointsRed.value.forEach((val, i) => {
      const y = GRAPH_HEIGHT / 2 - val * (GRAPH_HEIGHT / AMPLITUDE);
      if (i === 0) p.moveTo(0, y);
      else p.lineTo(i * xStep, y);
    });
    return p;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.head}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Cart
            style={styles.profileImage}
            images={require("../../assets/images/photoProfil.jpg")}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.title}>
              {profile.prenom ? `Bienvenue ${profile.prenom} ${profile.nom}` : "SmartStrap"}
            </Text>
            <Text style={[styles.statusText, { color: status.startsWith("🟢") ? "#00FF88" : "#FF4444" }]}>{status}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="settings-outline" size={24} color="black" />
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Vitals at the top */}
        <View style={styles.center}>
          <Text style={{ fontSize: 22, fontFamily: "LeagueSpartan_Bold" }}>
            Mes constantes
          </Text>

          <View style={styles.vitalLine}>
            <Text style={styles.vitalLabel}>Fréquence cardiaque: </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={styles.vitalValue}>
                {fréquenceCardiaque ? `${fréquenceCardiaque} bpm` : "- - -"}
              </Text>
              <FontAwesome5 name="heartbeat" size={20} color="#FD4755" />
            </View>
          </View>

          <View style={styles.vitalLine}>
            <Text style={styles.vitalLabel}>Oxygène: </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={styles.vitalValue}>
                {oxygene ? `${oxygene}%` : "- - -"}
              </Text>
              <MaterialDesignIcons name="waveform" size={24} color="#58a3f8ff" />
            </View>
          </View>
        </View>

        {/* Real-time Oscilloscope */}
        <View style={styles.liveGraphSection}>
          <Text style={styles.sectionTitle}>Flux en temps réel</Text>
          <View style={styles.graphContainer}>
            {typeof Skia !== 'undefined' ? (
              <Canvas style={{ flex: 1 }}>
                <Line
                  p1={{ x: 0, y: GRAPH_HEIGHT / 2 }}
                  p2={{ x: width - 40, y: GRAPH_HEIGHT / 2 }}
                  color="#222"
                  strokeWidth={1}
                />
                <Path
                  path={pathRed}
                  color="#FF4444"
                  style="stroke"
                  strokeWidth={1.5}
                  antiAlias
                  opacity={0.5}
                />
                <Path
                  path={pathIR}
                  color="#00FF88"
                  style="stroke"
                  strokeWidth={2.5}
                  antiAlias
                />
              </Canvas>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#444' }}>Graphique disponible sur mobile</Text>
              </View>
            )}
          </View>
          <View style={styles.dataRow}>
            <View style={[styles.smallCard, { borderLeftColor: "#00FF88" }]}>
              <Text style={styles.label}>IR AC</Text>
              <Text style={styles.valueSmall}>{currentSignals.ir.toFixed(1)}</Text>
            </View>
            <View style={[styles.smallCard, { borderLeftColor: "#FF4444" }]}>
              <Text style={styles.label}>RED AC</Text>
              <Text style={[styles.valueSmall, { color: "#FF4444" }]}>
                {currentSignals.red.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Prediction Section */}
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>Prédiction IA</Text>
          <View style={styles.aiCardContainer}>
            <BlurView intensity={20} tint="light" style={styles.aiCard}>
              <View style={styles.aiIconContainer}>
                <MaterialDesignIcons name="brain" size={40} color="#00386A" />
              </View>
              <View style={styles.aiTextContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Bientôt disponible</Text>
                </View>
                <Text style={styles.aiTitle}>Analyse prédictive</Text>
                <Text style={styles.aiDescription}>
                  Intelligence artificielle en cours d'apprentissage pour prédire votre santé...
                </Text>
              </View>
            </BlurView>
          </View>
        </View>

        {/* Health Insights Section */}
        <HealthInsights />

        {/* Other Sections */}
        <View style={styles.center}>
          <View style={styles.separator}></View>

          <Text style={styles.sectionTitle}>Analyses de la semaine</Text>
          <View style={{ height: 20 }}></View>
          
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

          <View style={styles.separator}></View>

          {/* Weekly Summary */}
          <View style={styles.cart}>
            <View style={{ padding: 20, width: "100%" }}>
              <Text style={styles.cardTitle}>Statistiques Hebdomadaires</Text>
              <Text style={styles.cardSubtitle}>
                Moyennes des constantes prises cette semaine
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
  scrollContent: { paddingBottom: 40 },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    height: 80,
  },
  profileImage: { height: 60, width: 60, borderRadius: 30, overflow: "hidden" },
  title: { fontSize: 18, fontFamily: "LeagueSpartan_Medium", color: "black" },
  statusText: { fontSize: 12, fontWeight: "bold" },
  liveGraphSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 20, fontFamily: "LeagueSpartan_Bold", marginBottom: 10 },
  graphContainer: {
    height: GRAPH_HEIGHT,
    width: "100%",
    backgroundColor: "#0A0A0A",
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  smallCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    width: "48%",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { color: "#777", fontSize: 10, fontWeight: "bold", marginBottom: 5 },
  valueSmall: { color: "#00FF88", fontSize: 18, fontWeight: "bold" },
  center: { alignItems: "center", marginTop: 20 },
  vitalLine: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  vitalLabel: { fontFamily: "LeagueSpartan_Medium", fontSize: 18 },
  vitalValue: { fontFamily: "LeagueSpartan_Bold", fontSize: 18 },
  separator: {
    height: 1,
    width: "80%",
    backgroundColor: "#DDD",
    marginVertical: 25,
  },
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
  cardTitle: { fontSize: 20, fontFamily: "LeagueSpartan_Medium", color: "black" },
  cardSubtitle: { fontSize: 14, fontFamily: "LeagueSpartan_Regular", color: "#666", marginBottom: 15 },
  aiSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  aiCardContainer: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  aiCard: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
  },
  aiIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "rgba(0, 56, 106, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontFamily: "LeagueSpartan_Bold",
    color: "#00386A",
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 12,
    fontFamily: "LeagueSpartan_Regular",
    color: "#555",
  },
  badge: {
    backgroundColor: "#00386A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "LeagueSpartan_Bold",
    textTransform: "uppercase",
  },
});
