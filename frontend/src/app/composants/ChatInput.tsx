import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
}: ChatInputProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="attach" size={28} color="white" />
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ecrivez ici........."
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          multiline={false}
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={onSend}
          disabled={!value.trim()}
        >
          <Ionicons name="paper-plane-outline" size={24} color={value.trim() ? "#00386A" : "#CCC"} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="mic-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#00386A",
    alignItems: "center",
  },
  iconButton: {
    padding: 5,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: "#FFF",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 44,
    alignItems: "center",
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontFamily: "LeagueSpartan_Regular",
  },
  sendButton: {
    padding: 5,
  },
});
