import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import type { Moment } from "@/context/MomentsContext";

interface WatermarkViewProps {
  photoUri: string;
  moment?: Pick<Moment, "timestamp" | "location" | "caption">;
  style?: ViewStyle;
  showFull?: boolean;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function WatermarkView({
  photoUri,
  moment,
  style,
  showFull = true,
}: WatermarkViewProps) {
  const locationText = moment?.location
    ? [moment.location.city, moment.location.country]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: photoUri }}
        style={styles.image}
        resizeMode="cover"
      />
      {showFull && moment && (
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.72)"]}
          style={styles.gradient}
        >
          <View style={styles.watermarkRow}>
            <View style={styles.metaBlock}>
              {moment.timestamp > 0 && (
                <Text style={styles.dateText}>
                  {formatDate(moment.timestamp)}
                </Text>
              )}
              {moment.timestamp > 0 && (
                <Text style={styles.timeText}>
                  {formatTime(moment.timestamp)}
                </Text>
              )}
              {locationText ? (
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationText}
                </Text>
              ) : null}
            </View>
            <Text style={styles.brandText}>moments.</Text>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 48,
    paddingBottom: Platform.OS === "ios" ? 16 : 12,
    paddingHorizontal: 14,
  },
  watermarkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  metaBlock: {
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  timeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  locationText: {
    color: "rgba(200,150,42,0.9)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },
  brandText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
});
