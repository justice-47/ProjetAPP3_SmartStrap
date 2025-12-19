import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../composants/navigation";
import { StyleSheet } from "react-native";
import { Text } from "react-native";


export default function ChatBot() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={{ fontFamily: 'LeagueSpartan_Black', fontSize: 50 }}>ChatBot</Text>
            <Navigation />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});