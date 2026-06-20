import { Feather } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMoments, type MomentLocation } from "@/context/MomentsContext";
import { useColors } from "@/hooks/useColors";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addMoment } = useMoments();
  const tabBarHeight = useBottomTabBarHeight();

  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [currentLocation, setCurrentLocation] =
    useState<MomentLocation | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isTaking, setIsTaking] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      if (!locationPermission?.granted) return;
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setCurrentLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          city: geo?.city ?? geo?.subregion ?? undefined,
          region: geo?.region ?? undefined,
          country: geo?.country ?? undefined,
        });
      } catch {
        // location unavailable
      }
    })();
  }, [locationPermission?.granted]);

  const takePicture = async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) setPreview(photo.uri);
    } catch {
      Alert.alert("Error", "Could not take photo. Please try again.");
    } finally {
      setIsTaking(false);
    }
  };

  const saveMoment = async () => {
    if (!preview) return;
    setIsSaving(true);
    try {
      const dir = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? "") + "moments/";

      // Always create with intermediates so nested dirs don't fail
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

      const filename = `moment_${Date.now()}.jpg`;
      const dest = dir + filename;

      // Try copy first; fall back to move if copy fails (some Expo Go sandboxes
      // don't allow reading from the camera's temp path via copyAsync)
      try {
        await FileSystem.copyAsync({ from: preview, to: dest });
      } catch {
        await FileSystem.moveAsync({ from: preview, to: dest });
      }

      await addMoment({
        photoUri: dest,
        timestamp: Date.now(),
        location: currentLocation ?? undefined,
        caption: caption.trim() || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPreview(null);
      setCaption("");
      router.replace("/(tabs)/gallery");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert("Could not save moment", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const locationText = currentLocation
    ? [currentLocation.city, currentLocation.country].filter(Boolean).join(", ")
    : null;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: "#0e0c0a" }]}>
        <Feather name="camera-off" size={48} color="rgba(255,255,255,0.4)" />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSub}>
          Allow camera access to capture your life moments.
        </Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={async () => {
            await requestPermission();
            await requestLocationPermission();
          }}
        >
          <Text style={styles.permBtnText}>Allow Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Preview screen (after taking a photo) ──────────────────────────────────
  if (preview) {
    return (
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: "#000" }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Full-screen photo behind everything */}
        <Image
          source={{ uri: preview }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Close button top-left */}
        <TouchableOpacity
          style={[styles.closeBtn, { top: topPad + 8 }]}
          onPress={() => {
            setPreview(null);
            setCaption("");
          }}
        >
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Spacer pushes the panel to the bottom */}
        <View style={styles.flex} />

        {/* Bottom panel — rises above keyboard automatically */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.88)"]}
          style={[styles.previewPanel, { paddingBottom: tabBarHeight + 12 }]}
        >
          {/* Watermark preview */}
          <View style={styles.watermarkPreview}>
            <Text style={styles.wDate}>{formatDate(now)}</Text>
            <Text style={styles.wTime}>{formatTime(now)}</Text>
            {locationText ? (
              <Text style={styles.wLocation}>{locationText}</Text>
            ) : null}
          </View>
          <Text style={styles.brandMark}>moments.</Text>

          {/* Caption input */}
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={caption}
            onChangeText={setCaption}
            returnKeyType="done"
            blurOnSubmit
          />

          {/* Actions */}
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => {
                setPreview(null);
                setCaption("");
              }}
            >
              <Feather name="rotate-ccw" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveMoment}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Moment</Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  // ── Live camera viewfinder ─────────────────────────────────────────────────
  return (
    <View style={[styles.flex, { backgroundColor: "#000" }]}>
      <CameraView ref={cameraRef} style={styles.flex} facing="back" />

      {/* Top branding */}
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Text style={styles.topLabel}>moments.</Text>
      </View>

      {/* Bottom HUD — shutter button, clears tab bar */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)"]}
        style={[styles.bottomHUD, { paddingBottom: tabBarHeight + 16 }]}
      >
        <View style={styles.watermarkLive}>
          <Text style={styles.wDate}>{formatDate(now)}</Text>
          <Text style={styles.wTime}>{formatTime(now)}</Text>
          {locationText ? (
            <Text style={styles.wLocation}>{locationText}</Text>
          ) : (
            <Text style={styles.wLocationFaint}>Fetching location…</Text>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.shutter,
            pressed && { opacity: 0.75, transform: [{ scale: 0.95 }] },
          ]}
          onPress={takePicture}
          disabled={isTaking}
        >
          {isTaking ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>

        {/* Balancing spacer */}
        <View style={{ width: 56 }} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  permTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
    textAlign: "center",
  },
  permSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  permBtn: {
    marginTop: 8,
    backgroundColor: "#c8962a",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  permBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  bottomHUD: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 48,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  watermarkLive: { flex: 1 },
  wDate: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  wTime: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  wLocation: {
    color: "rgba(200,150,42,0.9)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },
  wLocationFaint: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
    fontStyle: "italic",
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  // Preview screen
  closeBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  previewPanel: {
    paddingTop: 64,
    paddingHorizontal: 20,
    gap: 14,
  },
  watermarkPreview: { gap: 2 },
  brandMark: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    alignSelf: "flex-end",
    marginTop: -6,
  },
  captionInput: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  previewActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  retakeBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#c8962a",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
