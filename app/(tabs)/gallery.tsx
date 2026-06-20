import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MomentCard from "@/components/MomentCard";
import { useMoments } from "@/context/MomentsContext";
import { useColors } from "@/hooks/useColors";

const COLUMNS = 3;
const GAP = 2;

export default function GalleryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { moments } = useMoments();

  const screenWidth = Dimensions.get("window").width;
  const cardSize = (screenWidth - GAP * (COLUMNS - 1)) / COLUMNS;

  const sorted = useMemo(
    () => [...moments].sort((a, b) => b.timestamp - a.timestamp),
    [moments]
  );

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 80);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Moments
        </Text>
        <Text style={[styles.headerCount, { color: colors.mutedForeground }]}>
          {moments.length} captured
        </Text>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="image" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No moments yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Switch to the camera tab to capture your first moment.
          </Text>
          <TouchableOpacity
            style={[styles.goCamera, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)/camera")}
          >
            <Feather name="camera" size={18} color="#fff" />
            <Text style={styles.goCameraText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          numColumns={COLUMNS}
          scrollEnabled={!!sorted.length}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ paddingBottom: botPad }}
          renderItem={({ item }) => (
            <MomentCard
              moment={item}
              size={cardSize}
              onPress={() => router.push(`/moment/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  goCamera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
  },
  goCameraText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
