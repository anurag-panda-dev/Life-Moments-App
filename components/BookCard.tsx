import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import type { Photobook, Moment } from "@/context/MomentsContext";
import { useColors } from "@/hooks/useColors";

interface BookCardProps {
  book: Photobook;
  coverMoment?: Moment;
  onPress: () => void;
}

export default function BookCard({ book, coverMoment, onPress }: BookCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.coverContainer}>
        {coverMoment ? (
          <Image
            source={{ uri: coverMoment.photoUri }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderCover, { backgroundColor: colors.secondary }]}>
            <Feather name="book-open" size={32} color={colors.mutedForeground} />
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={styles.meta}>
          <Feather name="image" size={12} color={colors.mutedForeground} />
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {book.momentIds.length} {book.momentIds.length === 1 ? "moment" : "moments"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 16,
  },
  coverContainer: {
    height: 180,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  placeholderCover: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  info: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  count: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
