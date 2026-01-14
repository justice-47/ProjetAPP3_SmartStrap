import { View, Text, StyleSheet } from "react-native";

interface ChatBubbleProps {
  message: string;
  sender: string;
}

export default function ChatBubble({ message, sender }: ChatBubbleProps) {
  const isUser = sender === "user";

  return (
    <View
      style={[styles.container, isUser ? styles.userBubble : styles.botBubble]}
    >
      <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
  },
  userBubble: {
    backgroundColor: "#4F46E5",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: "#111827",
  },
});
