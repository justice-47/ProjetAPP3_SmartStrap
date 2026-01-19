import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (route: string) => {
    // @ts-ignore
    router.push(route);
  };

  const isActive = (route: string) => pathname === route;

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          height: 80 + Math.max(insets.bottom, 10),
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigateTo("/screens/Accueil")}
        style={styles.item}
      >
        <Ionicons
          name={"home"}
          color={isActive("/screens/Accueil") ? "#00386A" : "#000000ff"}
          size={isActive("/screens/Accueil") ? 30 : 25}
        />
        <Text
          style={[
            styles.label,
            {
              color: isActive("/screens/Accueil") ? "#00386A" : "#000000ff",
              fontSize: isActive("/screens/Accueil") ? 16 : 14,
            },
          ]}
        >
          Accueil
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo("/screens/MessagesScreen")}
        style={styles.item}
      >
        <Ionicons
          name="chatbubbles"
          size={isActive("/screens/MessagesScreen") ? 30 : 25}
          color={isActive("/screens/MessagesScreen") ? "#00386A" : "#000000ff"}
        />
        <Text
          style={[
            styles.label,
            {
              color: isActive("/screens/MessagesScreen") ? "#00386A" : "#000000ff",
              fontSize: isActive("/screens/MessagesScreen") ? 14 : 12,
            },
          ]}
        >
          Messages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo("/screens/NotificationsScreen")}
        style={styles.item}
      >
        <Ionicons
          name="notifications"
          size={isActive("/screens/NotificationsScreen") ? 30 : 25}
          color={isActive("/screens/NotificationsScreen") ? "#00386A" : "#000000ff"}
        />
        <Text
          style={[
            styles.label,
            {
              color: isActive("/screens/NotificationsScreen") ? "#00386A" : "#000000ff",
              fontSize: isActive("/screens/NotificationsScreen") ? 14 : 12,
            },
          ]}
        >
          Notifs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo("/screens/profil")}
        style={styles.item}
      >
        <Ionicons
          name="person-circle"
          size={isActive("/screens/profil") ? 30 : 25}
          color={isActive("/screens/profil") ? "#00386A" : "#000000ff"}
        />
        <Text
          style={[
            styles.label,
            {
              color: isActive("/screens/profil") ? "#00386A" : "#000000ff",
              fontSize: isActive("/screens/profil") ? 14 : 12,
            },
          ]}
        >
          Profil
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigateTo("/screens/chatbot")}
        style={styles.item}
      >
        <MaterialCommunityIcons
          name="robot"
          size={isActive("/screens/chatbot") ? 30 : 25}
          color={isActive("/screens/chatbot") ? "#00386A" : "#000000ff"}
        />
        <Text
          style={[
            styles.label,
            {
              color: isActive("/screens/chatbot") ? "#00386A" : "#000000ff",
              fontSize: isActive("/screens/chatbot") ? 14 : 12,
            },
          ]}
        >
          IA
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderRadius: 25,
    borderBottomLeftRadius:0,
    borderBottomRightRadius: 0,
    borderTopColor: "#ffffffff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "LeagueSpartan_Medium",
    // fontFamily is handled by ThemedText
  },
});
