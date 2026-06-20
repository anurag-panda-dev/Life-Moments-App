import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WatermarkView from "@/components/WatermarkView";
import { useMoments } from "@/context/MomentsContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W } = Dimensions.get("window");

export default function MomentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { moments, updateMoment, deleteMoment } = useMoments();

  const moment = moments.find((m) => m.id === id);
  const [editCaption, setEditCaption] = useState(false);
  const [caption, setCaption] = useState(moment?.caption ?? "");

  if (!moment) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Moment not found.</Text>
      </View>
    );
  }

  const locationText = moment.location
    ? [moment.location.city, moment.location.country]
        .filter(Boolean)
        .join(", ")
    : null;

  const handleSaveCaption = async () => {
    await updateMoment(id, { caption: caption.trim() || undefined });
    setEditCaption(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = () => {
    Alert.alert("Delete Moment", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMoment(id);
          router.back();
        },
      },
    ]);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
      >
        <WatermarkView
          photoUri={moment.photoUri}
          moment={moment}
          style={{ width: SCREEN_W, height: SCREEN_W }}
          showFull
        />

        <View style={styles.body}>
          <Text style={[styles.dateText, { color: colors.foreground }]}>
            {new Date(moment.timestamp).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
            {new Date(moment.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>

          {locationText && (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={13} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {locationText}
              </Text>
            </View>
          )}

          <View
            style={[styles.divider, { backgroundColor: colors.border }]}
          />

          {editCaption ? (
            <View style={styles.captionEdit}>
              <TextInput
                autoFocus
                multiline
                value={caption}
                onChangeText={setCaption}
                placeholder="Write a caption..."
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.captionInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              />
              <View style={styles.captionActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    setCaption(moment.caption ?? "");
                    setEditCaption(false);
                  }}
                >
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveCaption}
                >
                  <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captionRow}
              onPress={() => setEditCaption(true)}
            >
              {moment.caption ? (
                <Text style={[styles.captionText, { color: colors.foreground }]}>
                  {moment.caption}
                </Text>
              ) : (
                <Text style={[styles.captionPlaceholder, { color: colors.mutedForeground }]}>
                  Add a caption…
                </Text>
              )}
              <Feather name="edit-2" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 20 },
  dateText: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },
  captionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  captionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  captionPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  captionEdit: { gap: 10 },
  captionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  captionActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  saveBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
});
