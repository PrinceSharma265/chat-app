import { format } from "date-fns";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type MessageBubbleProps = {
  message: {
    id: string;
    username: string;
    text: string;
    timestamp: string;
  };
  isOwnMessage: boolean;
};

export default function MessageBubble({
  message,
  isOwnMessage,
}: MessageBubbleProps) {
  return (
    <View style={[styles.row, isOwnMessage ? styles.rowRight : styles.rowLeft]}>
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {!isOwnMessage && <Text style={styles.username}>{message.username}</Text>}
        <Text style={styles.messageText}>{message.text}</Text>
        <Text style={styles.timestamp}>
          {format(new Date(message.timestamp), "HH:mm")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    maxWidth: "75%",
  },
  rowLeft: {
    alignSelf: "flex-start",
  },
  rowRight: {
    alignSelf: "flex-end",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: colors.primary,
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  username: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },
});
