import {
  View,
  FlatList,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatBubble from "../composants/ChatBubble";
import ChatInput from "../composants/ChatInput";
import Navigation from "../composants/navigation";
import { API_URL } from "../../src/config";

export default function ChatbotScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      message:
        "Bonjour, je suis votre assistant santé. Comment puis-je vous aider ?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  // Real health context from state
  const [vitals, setVitals] = useState({
    heartRate: 75,
    spo2: 98,
    age: 25
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedId = await AsyncStorage.getItem("userId");
        if (storedId) {
          // Fetch user profile for age
          const userRes = await fetch(`${API_URL}/api/users/profile/${storedId}`);
          const userData = await userRes.json();
          
          // Fetch current vitals
          const hrRes = await fetch(`${API_URL}/api/heart-rate`);
          const hrData = await hrRes.json();
          const oxRes = await fetch(`${API_URL}/api/oxygene-rate`);
          const oxData = await oxRes.json();

          setVitals({
            heartRate: hrData.heartRate || 75,
            spo2: oxData.spo2 || 98,
            age: parseInt(userData.age) || 25
          });
        }
      } catch (err) {
        console.log("Error fetching context for chat:", err);
      }
    };

    fetchUserData();
  }, []);

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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsgText = input;
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: userMsgText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsBotTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          userContext: vitals,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          message: data.reply || data.error || "Une erreur inconnue est survenue.",
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          message: "Désolé, j'ai une erreur de connexion. Vérifiez que le serveur est lancé.",
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="robot" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Assistant Santé</Text>
            <Text style={styles.headerSubtitle}>En ligne</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.contentContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble message={item.message} isUser={item.sender === 'user'} />
            )}
            ListFooterComponent={
              isBotTyping ? (
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>L'assistant réfléchit...</Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.chatListContent}
            style={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={[
            styles.inputWrapper, 
            { paddingBottom: isKeyboardVisible ? 10 : 80 + Math.max(insets.bottom, 10) }
          ]}>
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={sendMessage}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Navigation Bar - Preserved */}
      {!isKeyboardVisible && <Navigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  inputWrapper: {
    backgroundColor: "#F3F4F6",
  },
  typingIndicator: {
    padding: 10,
    marginLeft: 10,
  },
  typingText: {
    fontSize: 12,
    color: "#666",
    fontStyle: 'italic',
  }
});
