import { LinearGradient, vec } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { Area, CartesianChart, Line } from "victory-native";

const { width: screenWidth } = Dimensions.get("window");

interface OxygeneRateData {
  x: number; // Temps en Timestamp (millisecondes) au lieu de Date
  y: number; // SpO2
  [key: string]: any; // <-- CORRECTION TYPESCRIPT ICI
}

interface OxygeneRateChartProps {
  data: OxygeneRateData[];
}

export default function OxygeneRateChart({ data }: OxygeneRateChartProps) {
  const chartWidth = screenWidth * 0.87;
  const chartHeight = 250;

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
          domain={{ y: [40, 200] }} // Bornes physiologiques (ou [80, 100] pour le SpO2)
          axisOptions={{
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
              {/* Zone Bleue en dessous de la ligne */}
              <Area
                points={points.y}
                y0={chartBounds.bottom}
                animate={{ type: "timing", duration: 1000 }}
              >
                <LinearGradient
                  start={vec(0, chartBounds.top)}
                  end={vec(0, chartBounds.bottom)}
                  colors={["#4A88DE60", "#4A88DE05"]} // Dégradé bleu
                />
              </Area>

              {/* Ligne principale Bleue */}
              <Line
                points={points.y}
                color="#4A88DE"
                strokeWidth={2.5}
                animate={{ type: "timing", duration: 800 }}
              />

              {/* Point actif Bleu */}
              {points.y.length > 0 && (
                <Line
                  points={[
                    points.y[points.y.length - 1],
                    points.y[points.y.length - 1],
                  ]}
                  color="#4A88DE"
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
