import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";

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
      <TextInput
        style={styles.input}
        placeholder="Écrivez votre message..."
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity style={styles.button} onPress={onSend}>
        <Text style={styles.buttonText}>Envoyer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  button: {
    marginLeft: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});
