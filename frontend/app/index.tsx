import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ThemedButton from "../src/components/ThemedButton";
import { colors } from "../src/theme/colors";

const USERNAME_STORAGE_KEY = "chat_username";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredUsername = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Failed to load username", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUsername();
  }, []);

  const handleJoin = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      return;
    }

    try {
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, trimmedUsername);
    } catch (error) {
      console.error("Failed to save username", error);
    }

    router.push({ pathname: "/chat", params: { username: trimmedUsername } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.card}>
        <Text style={styles.title}>ChatApp</Text>
        <Text style={styles.subtitle}>Enter your username to join the room</Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleJoin}
          editable={!isLoading}
        />

        <ThemedButton
          title="Join Chat"
          onPress={handleJoin}
          disabled={!username.trim() || isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: 18,
  },
});
