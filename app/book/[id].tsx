import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WatermarkView from "@/components/WatermarkView";
import { useMoments } from "@/context/MomentsContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { books, moments, deleteBook } = useMoments();

  const book = books.find((b) => b.id === id);
  const [currentPage, setCurrentPage] = useState(0);
  const flatRef = useRef<FlatList>(null);

  if (!book) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Book not found.</Text>
      </View>
    );
  }

  const bookMoments = book.momentIds
    .map((mid) => moments.find((m) => m.id === mid))
    .filter(Boolean) as typeof moments;

  const handleDelete = () => {
    Alert.alert("Delete Photobook", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteBook(id);
          router.back();
        },
      },
    ]);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (page !== currentPage) {
      setCurrentPage(page);
      Haptics.selectionAsync();
    }
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const photoH = SCREEN_H - topPad - botPad - 100;

  return (
    <View style={[styles.flex, { backgroundColor: "#0e0c0a" }]}>
      <View style={[styles.navBar, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={styles.pageCounter}>
            {currentPage + 1} / {bookMoments.length}
          </Text>
        </View>
        <TouchableOpacity style={styles.navBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color="rgba(255,80,60,0.85)" />
        </TouchableOpacity>
      </View>

      {bookMoments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No moments in this book.</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatRef}
            data={bookMoments}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={!!bookMoments.length}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_W, height: photoH }}>
                <WatermarkView
                  photoUri={item.photoUri}
                  moment={item}
                  style={{ width: SCREEN_W, height: photoH }}
                  showFull
                />
              </View>
            )}
          />

          <View style={[styles.dots, { paddingBottom: botPad + 16 }]}>
            {bookMoments.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === currentPage
                        ? "#c8962a"
                        : "rgba(255,255,255,0.3)",
                    width: i === currentPage ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenter: {
    flex: 1,
    alignItems: "center",
  },
  bookTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  pageCounter: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
