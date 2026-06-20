import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Moment } from "@/context/MomentsContext";

interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
  size: number;
}

function shortDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function MomentCard({ moment, onPress, size }: MomentCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { width: size, height: size }]}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: moment.photoUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={styles.gradient}
      >
        <Text style={styles.date}>{shortDate(moment.timestamp)}</Text>
        {moment.location?.city ? (
          <Text style={styles.location} numberOfLines={1}>
            {moment.location.city}
          </Text>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    backgroundColor: "#1a1814",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  date: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  location: {
    color: "rgba(200,150,42,0.85)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});
