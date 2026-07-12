import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function ThemedButton({ title, onPress, disabled = false }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.disabledText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
  },
  pressedButton: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: colors.text,
  },
});
