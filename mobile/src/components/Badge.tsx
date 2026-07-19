import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";

export function Badge({
  label,
  color,
  backgroundColor,
  dot = true,
}: {
  label: string;
  color: string;
  backgroundColor: string;
  dot?: boolean;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  dot: { width: 5, height: 5, borderRadius: 3, marginRight: 5 },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    textTransform: "capitalize",
    letterSpacing: 0.12,
  },
});
