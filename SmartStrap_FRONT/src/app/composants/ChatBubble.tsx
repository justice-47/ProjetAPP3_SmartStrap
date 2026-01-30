import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  avatar?: any;
}

export default function ChatBubble({
  message,
  isUser,
  timestamp,
  avatar,
}: ChatBubbleProps) {
  // If no avatar is provided, use default robot for bot or account for user
  const isBot = !isUser && !avatar;

  return (
    <View
      style={[styles.wrapper, isUser ? styles.userWrapper : styles.botWrapper]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          {isBot ? (
            <View style={[styles.avatar, styles.botAvatar]}>
              <MaterialCommunityIcons name="robot" size={24} color="white" />
            </View>
          ) : (
            <Image
              source={
                avatar || require("../../../assets/images/photoProfil.jpg")
              }
              style={styles.avatar}
            />
          )}
        </View>
      )}

      <View style={styles.bubbleContainer}>
        <View
          style={[
            styles.container,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[styles.text, isUser ? styles.userText : styles.botText]}
          >
            {message}
          </Text>
        </View>

        {timestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {timestamp}
          </Text>
        )}
      </View>

      {isUser && (
        <View style={styles.avatarContainerUser}>
          <Image
            source={require("../../../assets/images/photoProfil.jpg")}
            style={styles.avatar}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginVertical: 10,
    paddingHorizontal: 15,
    alignItems: "flex-start",
  },
  userWrapper: {
    justifyContent: "flex-end",
  },
  botWrapper: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 10,
    alignSelf: "center",
  },
  avatarContainerUser: {
    marginLeft: 10,
    alignSelf: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEE",
  },
  botAvatar: {
    backgroundColor: "#00386A",
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleContainer: {
    maxWidth: "75%",
    flexShrink: 1,
  },
  container: {
    padding: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#5DADE2", // Light blue from mockup
  },
  botBubble: {
    backgroundColor: "#E8F4F8", // Very light blue/white from mockup
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "LeagueSpartan_Regular",
  },
  userText: {
    color: "#00386A",
  },
  botText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    color: "#999",
    fontFamily: "LeagueSpartan_Regular",
  },
  userTimestamp: {
    alignSelf: "flex-end",
    marginRight: 5,
  },
  botTimestamp: {
    alignSelf: "flex-start",
    marginLeft: 5,
  },
});
