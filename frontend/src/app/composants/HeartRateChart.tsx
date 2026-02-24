import { LinearGradient, vec } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { Area, CartesianChart, Line } from "victory-native";

const { width: screenWidth } = Dimensions.get("window");

interface HeartRateData {
  x: number; // Temps en Timestamp (millisecondes)
  y: number; // BPM
  [key: string]: any; // <-- CORRECTION TYPESCRIPT ICI
}

interface HeartRateChartProps {
  data: HeartRateData[];
}

export default function HeartRateChart({ data }: HeartRateChartProps) {
  const chartWidth = screenWidth * 0.87;
  const chartHeight = 250;

  // Sécurité : si aucune donnée n'est encore chargée par l'API
  if (!data || data.length === 0) {
    return (
      <View
        style={{
          width: chartWidth,
          height: chartHeight,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffffff",
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#666" }}>Chargement du graphique...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: chartWidth,
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "#ffffffff",
        borderRadius: 10,
      }}
    >
      <View style={{ height: chartHeight, width: chartWidth - 30 }}>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={["y"]}
          domain={{ y: [40, 200] }} // Bornes physiologiques
          axisOptions={{
            // Formate le timestamp pour afficher "HH:MM"
            formatXLabel: (value) => {
              const date = new Date(value);
              return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
            },
            lineColor: "#E5E7EB",
            labelColor: "#363636",
          }}
        >
          {({ points, chartBounds }) => (
            <>
              {/* Zone verte en dessous de la ligne */}
              <Area
                points={points.y}
                y0={chartBounds.bottom}
                animate={{ type: "timing", duration: 1000 }}
              >
                <LinearGradient
                  start={vec(0, chartBounds.top)}
                  end={vec(0, chartBounds.bottom)}
                  colors={["#4ADE8060", "#4ADE8005"]} // Dégradé de transparence
                />
              </Area>

              {/* Ligne principale pointillée ou pleine */}
              <Line
                points={points.y}
                color="#25CD25"
                strokeWidth={2.5}
                animate={{ type: "timing", duration: 800 }}
              />

              {/* Le point actif (Dernière valeur enregistrée) */}
              {points.y.length > 0 && (
                <Line
                  points={[
                    points.y[points.y.length - 1],
                    points.y[points.y.length - 1],
                  ]}
                  color="#22C55E"
                  strokeWidth={10}
                  strokeCap="round"
                />
              )}
            </>
          )}
        </CartesianChart>
      </View>
    </View>
  );
}
