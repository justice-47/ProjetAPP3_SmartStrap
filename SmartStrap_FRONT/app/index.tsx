import { Stack } from "expo-router";
import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: 300, height: 300, marginBottom: -80 }}
      />
      <Text style={{ fontSize: 40, fontWeight: '300', textAlign: 'center', justifyContent: 'center', marginTop: 0 }}>Smart</Text>
      <Text style={{ fontSize: 40, fontWeight: '300', textAlign: 'center', justifyContent: 'center', marginTop: -20 }}>Strap</Text>
      <Text style={{ fontSize: 16, fontFamily: 'Poppins_400Regular', fontWeight: 'bold', textAlign: 'center', justifyContent: 'center', marginTop: 15 }}>Bracelet Intelligent</Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffffff",
  },
});
