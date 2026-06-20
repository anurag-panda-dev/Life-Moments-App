import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BookCard from "@/components/BookCard";
import { useMoments } from "@/context/MomentsContext";
import { useColors } from "@/hooks/useColors";

export default function BooksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { books, moments } = useMoments();

  const momentMap = useMemo(
    () => Object.fromEntries(moments.map((m) => [m.id, m])),
    [moments]
  );

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 80);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Photobooks
        </Text>
        <Text style={[styles.headerCount, { color: colors.mutedForeground }]}>
          {books.length} {books.length === 1 ? "book" : "books"}
        </Text>
      </View>

      {books.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="book-open" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No photobooks yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Curate your moments into beautiful photobooks.
          </Text>
          {moments.length > 0 && (
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/book/create");
              }}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.createBtnText}>Create Photobook</Text>
            </TouchableOpacity>
          )}
          {moments.length === 0 && (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Capture some moments first to create a photobook.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          scrollEnabled={!!books.length}
          contentContainerStyle={[styles.list, { paddingBottom: botPad }]}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              coverMoment={
                item.coverMomentId
                  ? momentMap[item.coverMomentId]
                  : momentMap[item.momentIds[0]]
              }
              onPress={() => router.push(`/book/${item.id}`)}
            />
          )}
        />
      )}

      {books.length > 0 && moments.length > 0 && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              bottom: botPad + 16,
              right: 20,
            },
          ]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/book/create");
          }}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
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
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
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
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
