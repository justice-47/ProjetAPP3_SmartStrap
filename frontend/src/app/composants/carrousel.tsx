import React, { useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

const { width } = Dimensions.get("window");

interface CarouselTabsProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
}

export default function CarouselTabs<T>({
  data,
  renderItem,
}: CarouselTabsProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={{ width: "100%", overflow: "hidden" }}>
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View
            style={{ width, alignItems: "center", justifyContent: "center" }}
          >
            {renderItem({ item })}
          </View>
        )}
      />

      {/* Indicateur d'onglets */}
      <View style={styles.tabs}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[styles.tab, activeIndex === index && styles.tabActive]}
          />
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  tab: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  tabActive: {
    width: 20,
    backgroundColor: "#00386A",
  },
});
