import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatBubble from "../composants/ChatBubble";
import ChatInput from "../composants/ChatInput";
import Navigation from "../composants/navigation";

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      message:
        "Bonjour, je suis votre assistant santé. Comment puis-je vous aider ?",
    },
  ]);

  const [input, setInput] = useState("");

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = {
    id: Date.now().toString(),
    sender: "user",
    message: input,
  };

  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const response = await fetch("http://10.0.2.2:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage.message,
        userContext: {
          age: 22,
          heartRate: 92,
          spo2: 97,
          sleepQuality: "Faible",
        },
      }),
    });

    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "bot",
        message: data.reply,
      },
    ]);
  } catch (error) {
    console.error(error);
  }
};


  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            paddingBottom: isKeyboardVisible
              ? 0
              : 80 + Math.max(insets.bottom, 10),
          }}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble message={item.message} sender={item.sender} />
            )}
            contentContainerStyle={[styles.chat, { paddingBottom: 20 }]}
            style={{ flex: 1 }}
          />

          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>
      {!isKeyboardVisible && <Navigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  chat: {
    padding: 12,
  },
});
