import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMoments } from "@/context/MomentsContext";
import { useColors } from "@/hooks/useColors";

const COLUMNS = 3;
const GAP = 2;

export default function CreateBookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { moments, createBook } = useMoments();

  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const cardSize = (screenWidth - GAP * (COLUMNS - 1)) / COLUMNS;

  const sorted = useMemo(
    () => [...moments].sort((a, b) => b.timestamp - a.timestamp),
    [moments]
  );

  const toggleSelect = async (id: string) => {
    await Haptics.selectionAsync();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Name required", "Please give your photobook a name.");
      return;
    }
    if (selected.size === 0) {
      Alert.alert("No moments selected", "Select at least one moment.");
      return;
    }
    setIsSaving(true);
    try {
      const orderedIds = sorted
        .filter((m) => selected.has(m.id))
        .map((m) => m.id);
      await createBook(title.trim(), orderedIds);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/books");
    } finally {
      setIsSaving(false);
    }
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingTop: topPad, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>
          New Photobook
        </Text>
        <TouchableOpacity
          style={[
            styles.doneBtn,
            {
              backgroundColor: selected.size > 0 && title.trim() ? colors.primary : colors.muted,
            },
          ]}
          onPress={handleCreate}
          disabled={isSaving}
        >
          <Text
            style={[
              styles.doneBtnText,
              {
                color: selected.size > 0 && title.trim() ? "#fff" : colors.mutedForeground,
              },
            ]}
          >
            Create
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.titleInput,
          {
            color: colors.foreground,
            borderBottomColor: colors.border,
          },
        ]}
        placeholder="Photobook name..."
        placeholderTextColor={colors.mutedForeground}
        value={title}
        onChangeText={setTitle}
        returnKeyType="done"
        maxLength={60}
      />

      <View style={[styles.sectionRow, { paddingHorizontal: 16 }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Select moments
        </Text>
        <Text style={[styles.sectionCount, { color: colors.primary }]}>
          {selected.size} selected
        </Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        scrollEnabled={!!sorted.length}
        columnWrapperStyle={{ gap: GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        contentContainerStyle={{ paddingBottom: botPad }}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleSelect(item.id)}
              activeOpacity={0.8}
              style={{ width: cardSize, height: cardSize }}
            >
              <Image
                source={{ uri: item.photoUri }}
                style={[StyleSheet.absoluteFill, { opacity: isSelected ? 0.6 : 1 }]}
                resizeMode="cover"
              />
              {isSelected && (
                <View style={styles.checkOverlay}>
                  <View style={styles.checkCircle}>
                    <Feather name="check" size={16} color="#fff" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  doneBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  titleInput: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    letterSpacing: -0.3,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  checkOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    padding: 6,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#c8962a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});
