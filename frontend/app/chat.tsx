import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MessageBubble from "../src/components/MessageBubble";
import { API_URL } from "../src/constants/config";
import { colors } from "../src/theme/colors";
import { connectSocket, disconnectSocket, getSocket } from "../src/services/socket";

type Message = {
  id: string;
  username: string;
  text: string;
  timestamp: string;
};

export default function ChatScreen() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  const currentUsername = typeof username === "string" && username.trim() !== "" ? username.trim() : "Guest";
  const flatListRef = useRef<FlatList<Message>>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/messages`);
        if (!response.ok) {
          throw new Error("Failed to load history");
        }

        const data = await response.json();
        if (isMounted) {
          setMessages(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
        if (isMounted) {
          setError("Unable to load chat history");
        }
      }
    };

    const socket = connectSocket();

    const handleConnect = () => {
      console.log("Socket connected, joining as", currentUsername);
      socket.emit("user_join", { username: currentUsername });
    };

    const handleIncomingMessage = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    };

    const handleOnlineUsers = (users: string[]) => {
      console.log("Online users update:", users);
      setOnlineUsers(users);
    };

    const handleUserTyping = (payload: { username?: string }) => {
      if (!payload?.username || payload.username === currentUsername) {
        return;
      }

      setTypingUsers((prev) => {
        if (prev.includes(payload.username!)) {
          return prev;
        }
        return [...prev, payload.username!];
      });
    };

    const handleUserStoppedTyping = (payload: { username?: string }) => {
      if (!payload?.username) {
        return;
      }

      setTypingUsers((prev) => prev.filter((username) => username !== payload.username));
    };

    const handleErrorMessage = (payload: { error?: string }) => {
      console.error("Socket error", payload);
      setError(payload?.error ?? "Unable to send message");
    };

    // Register ALL listeners first, before checking connection state.
    // This avoids missing events if the socket is already connected
    // by the time this effect runs (e.g. fast refresh, remounts).
    socket.on("connect", handleConnect);
    socket.on("receive_message", handleIncomingMessage);
    socket.on("online_users", handleOnlineUsers);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);
    socket.on("error_message", handleErrorMessage);

    // If it's already connected by the time this effect runs, fire manually too.
    if (socket.connected) {
      handleConnect();
    }

    loadHistory();

    return () => {
      isMounted = false;
      socket.off("connect", handleConnect);
      socket.off("receive_message", handleIncomingMessage);
      socket.off("online_users", handleOnlineUsers);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
      socket.off("error_message", handleErrorMessage);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      disconnectSocket();
    };
  }, [currentUsername]);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages.length]);

  const clearTypingTimer = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const emitTypingStop = () => {
    const socket = getSocket();
    if (socket?.connected && isTypingRef.current) {
      socket.emit("typing_stop", { username: currentUsername });
      isTypingRef.current = false;
    }
  };

const handleInputChange = (value: string) => {
    setInputValue(value);

    const socket = getSocket();
    console.log("handleInputChange fired. Socket connected?", socket?.connected, "isTypingRef:", isTypingRef.current);
    if (!socket?.connected) {
      console.log("Socket not connected, aborting typing emit");
      return;
    }

    if (value.trim() !== "" && !isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", { username: currentUsername });
    }

    clearTypingTimer();

    if (value.trim() !== "") {
      typingTimeoutRef.current = setTimeout(() => {
        emitTypingStop();
      }, 1500);
    } else {
      emitTypingStop();
    }
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) {
      setError("Socket is not connected");
      return;
    }

    emitTypingStop();
    clearTypingTimer();
    socket.emit("send_message", { username: currentUsername, text: trimmed });
    setInputValue("");
    setTypingUsers((prev) => prev.filter((username) => username !== currentUsername));
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.headerBar}>
        <Text style={styles.appTitle}>ChatApp</Text>
        <View style={styles.headerMeta}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{onlineUsers.length} online</Text>
          </View>
          <Text style={styles.usernameText}>{currentUsername}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        renderItem={({ item }) => {
          const isOwnMessage = item.username === currentUsername;
          return <MessageBubble message={item} isOwnMessage={isOwnMessage} />;
        }}
      />

      {typingUsers.length > 0 ? (
        <View style={styles.typingRow}>
          <Text style={styles.typingText}>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.length} people are typing...`}
          </Text>
        </View>
      ) : null}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={240}
          value={inputValue}
          onChangeText={handleInputChange}
        />
        <TouchableOpacity style={styles.sendButton} accessibilityLabel="Send message" onPress={handleSend}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  usernameText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 227, 154, 0.15)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "600",
  },
  errorBanner: {
    backgroundColor: "rgba(255, 92, 92, 0.15)",
    borderWidth: 1,
    borderColor: colors.error,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  messageListContent: {
    paddingBottom: 16,
  },
  typingRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: colors.surface,
  },
  typingText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});