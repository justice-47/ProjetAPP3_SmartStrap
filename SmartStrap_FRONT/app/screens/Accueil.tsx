import { ScrollView, StyleSheet, Text, View, StatusBar } from "react-native";
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
import { API_URL } from "../config";



export default function Accueil() {
  const [fréquenceCardiaque, setFréquenceCardiaque] = useState(null);
  const [oxygene, setOxygene] = useState(null);
  const [heartRateData, setHeartRateData] = useState<{ x: Date; y: number }[]>(
    []
  );
  const [oxygenData, setOxygenData] = useState<{ x: Date; y: number }[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    heartRateAvg: 0,
    spo2Avg: 0,
  });

  // Static data removed in favor of dynamic API data
  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const response = await fetch(`${API_URL}/api/heart-rate`);
        const oxygeneResponse = await fetch(`${API_URL}/api/oxygene-rate`);
        const oxygeneData = await oxygeneResponse.json();
        const data = await response.json();

        setFréquenceCardiaque(data.heartRate);
        setOxygene(oxygeneData.spo2);
        setHeartRateData(
          (data.heartRateHistory || []).map(
            (item: { x: string; y: number }) => ({
              x: new Date(item.x),
              y: item.y,
            })
          )
        );
        setOxygenData(
          (oxygeneData.oxygenHistory || []).map(
            (item: { x: string; y: number }) => ({
              x: new Date(item.x),
              y: item.y,
            })
          )
        );

        // Fetch Weekly Stats
        const weeklyResponse = await fetch(`${API_URL}/api/heart-rate/weekly`);
        const oxygeneWeeklyResponse = await fetch(
          `${API_URL}/api/oxygene-rate/weekly`
        );
        const weeklyData = await weeklyResponse.json();
        const oxygeneWeeklyData = await oxygeneWeeklyResponse.json();
        setWeeklyStats({
          heartRateAvg: weeklyData.weeklyAvgHeartRate,
          spo2Avg: oxygeneWeeklyData.weeklyAvgSpo2,
        });
      } catch (error) {
        console.error(
          `Erreur lors du chargement des constantes depuis ${API_URL}`,
          error
        );
      }
    };

    fetchVitals();

    const interval = setInterval(fetchVitals, 5000); // rafraîchit toutes les 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.head}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Cart
            style={styles.profileImage}
            images={require("../../assets/images/photoProfil.jpg")}
            resizeMode="cover"
          />
          <Text style={styles.title}>Bienvenue sur SmartStrap </Text>
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
        {/* Cart bracelet */}
        <View style={styles.center}>
          <Cart
            style={styles.braceletCart}
            text="Connectez le bracelet"
            icons={
              <Ionicons name="warning-outline" size={24} color="#FF9900" />
            }
            styleText={styles.braceletText}
          />
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 22, fontFamily: "LeagueSpartan_Bold" }}>
            Mes constantes
          </Text>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 30,
            }}
          >
            <Text style={{ fontFamily: "LeagueSpartan_Medium", fontSize: 20 }}>
              Fréquence cardiaque:{" "}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontFamily: "LeagueSpartan_Bold", fontSize: 16 }}>
                {fréquenceCardiaque ? `${fréquenceCardiaque} bpm` : "- - -"}
              </Text>
              <FontAwesome5 name="heartbeat" size={20} color="#FD4755" />
            </View>
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 30,
            }}
          >
            <Text style={{ fontFamily: "LeagueSpartan_Medium", fontSize: 20 }}>
              Oxygène:
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontFamily: "LeagueSpartan_Bold", fontSize: 16 }}>
                {oxygene ? `${oxygene}%` : "- - -"}
              </Text>
              <MaterialDesignIcons
                name="waveform"
                size={24}
                color="#58a3f8ff"
              />
            </View>
          </View>
          <View
            style={{
              height: 1,
              width: "80%",
              backgroundColor: "#a6a6a6ff",
              marginVertical: 30,
            }}
          ></View>
          <Cart
            style={{
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingHorizontal: 30,
            }}
            styleText={{
              fontSize: 22,
              fontFamily: "LeagueSpartan_Medium",
              color: "black",
              textAlign: "left",
            }}
            text="Courbe de fréquence cardiaque"
          />
          <Cart
            style={{
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingHorizontal: 30,
            }}
            styleText={{
              fontSize: 16,
              fontFamily: "LeagueSpartan_Regular",
              color: "black",
              textAlign: "left",
            }}
            text="Surveillance en temps réel des mesures"
          />
          <View style={{ height: 20 }}></View>
          <View>
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
          </View>

          <View
            style={{
              height: 1,
              width: "80%",
              backgroundColor: "#a6a6a6ff",
              marginVertical: 30,
            }}
          ></View>

          <View style={styles.cart}>
            <View style={{ padding: 20, width: "100%" }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "LeagueSpartan_Medium",
                  color: "black",
                }}
              >
                Indice de risque respiratoire
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "LeagueSpartan_Regular",
                  color: "black",
                }}
              >
                Prédiction de l'intelligence artificielle
              </Text>
              <HeartRateChart data={heartRateData} />
            </View>
          </View>
          <View
            style={{
              height: 1,
              width: "80%",
              backgroundColor: "#a6a6a6ff",
              marginVertical: 30,
            }}
          ></View>
          <View style={[styles.cart, { backgroundColor: "#ffffffff" }]}>
            <View style={{ padding: 20, width: "100%" }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "LeagueSpartan_Medium",
                  color: "black",
                }}
              >
                Statistiques Hebdomadaires
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "LeagueSpartan_Regular",
                  color: "black",
                }}
              >
                Moyennes des constantes prises cette semaine
              </Text>
              <View>
                <WeeklyStatsCard
                  heartRateAvg={weeklyStats.heartRateAvg}
                  spo2Avg={weeklyStats.spo2Avg}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <Navigation />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F3",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    height: 80,
  },

  profileImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    overflow: "hidden",
  },

  title: {
    fontSize: 18,
    fontFamily: "LeagueSpartan_Medium",
    color: "black",
  },

  center: {
    alignItems: "center",
    marginTop: 20,
  },

  braceletCart: {
    backgroundColor: "#FEE08D",
    height: 50,
    width: "90%",
    borderColor: "#FF9900",
    borderWidth: 2,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  braceletText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "LeagueSpartan_Medium",
  },
  cart: {
    width: "90%",
    padding: 10,
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    overflow: "hidden",
  },
});
