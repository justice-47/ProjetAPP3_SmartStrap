import { View, Dimensions } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryScatter,
} from "victory-native";
import Svg, { Defs, LinearGradient, Stop } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

interface OxygeneRateData {
  x: Date; // Temps
  y: number; // SpO2
}

interface OxygeneRateChartProps {
  data: OxygeneRateData[];
}

export default function OxygeneRateChart({ data }: OxygeneRateChartProps) {
  const lastPoint = data.length > 0 ? [data[data.length - 1]] : [];

  // Calculer la largeur du graphique pour qu'il tienne dans une page du carousel
  const chartWidth = screenWidth * 0.9;
  const chartHeight = 250;

  return (
    <View style={{ width: screenWidth * 0.87, alignItems: "center", paddingVertical: 20, backgroundColor: "#ffffffff" ,borderRadius: 10}}>
      <Svg height={chartHeight} width={chartWidth}>
        <Defs>
          {/* Gradient de remplissage */}
          <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4a88deff" stopOpacity="0.4" />
            <Stop offset="50%" stopColor="#4a99deff" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#4a88deff" stopOpacity="0.05" />
          </LinearGradient>

          {/* Gradient de ligne */}
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#4a88deff" />
            <Stop offset="50%" stopColor="#4a99deff" />
            <Stop offset="100%" stopColor="#4a88deff" />
          </LinearGradient>
        </Defs>

        <VictoryChart
          height={chartHeight}
          width={chartWidth}
          scale={{ x: "time", y: "linear" }}
          padding={{ top: 10, bottom: 40, left: 50, right: 30 }}
        >
          {/* Axe X : Temps */}
          <VictoryAxis
            tickFormat={(t) =>
              new Date(t).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            style={{
              axis: { stroke: "#E5E7EB", strokeWidth: 1 },
              ticks: { stroke: "transparent" },
              tickLabels: {
                fill: "#363636ff",
                fontSize: 11,
                fontWeight: "500",
              },
              grid: { stroke: "transparent" },
            }}
          />

          {/* Axe Y : SpO2 */}
          <VictoryAxis
            dependentAxis
            domain={[40, 200]} // bornes physiologiques
            style={{
              axis: { stroke: "#E5E7EB", strokeWidth: 1 },
              ticks: { stroke: "transparent" },
              tickLabels: {
                fill: "#363636ff",
                fontSize: 11,
                fontWeight: "500",
              },
              grid: {
                stroke: "#F3F4F6",
                strokeWidth: 1,
              },
            }}
          />

          {/* Zone remplie */}
          <VictoryArea
            data={data}
            interpolation="natural"
            animate={{
              duration: 1000,
              onLoad: { duration: 1000 },
              easing: "cubicInOut",
            }}
            style={{
              parent: {
                backgroundColor: "#F3F4F6",
              },
              data: {
                fill: "transparent", // Gradient vertical (haut → bas)
                stroke: "transparent",
              },
            }}
          />

          {/* Ligne principale */}
          <VictoryLine
            data={data}
            interpolation="natural"
            animate={{
              duration: 1000,
              onLoad: { duration: 800 },
              easing: "cubicInOut",
            }}
            style={{
              data: {
                stroke: "#4a88deff", // Gradient horizontal (gauche → droite)
                strokeWidth: 2.5,
                strokeLinecap: "round",
                strokeDasharray: "5,5",
              },
            }}
          />

          {/* Points */}
          <VictoryScatter
            data={data}
            size={3.5}
            style={{
              data: {
                fill: "#4a88deff",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              },
            }}
          />

          {/* Point actif */}
          <VictoryScatter
            data={lastPoint}
            size={8}
            style={{
              data: {
                fill: "#4a88deff",
                stroke: "#FFFFFF",
                strokeWidth: 3,
              },
            }}
          />

          {/* Anneau du point actif */}
          <VictoryScatter
            data={lastPoint}
            size={14}
            style={{
              data: {
                fill: "none",
                stroke: "#4a88deff",
                strokeWidth: 2,
                opacity: 0.5,
              },
            }}
          />
        </VictoryChart>
      </Svg>
    </View>
  );
}
