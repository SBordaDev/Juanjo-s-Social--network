import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../utils/supabase";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  const fetchProfile = async () => {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("No hay usuario logueado:", userError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "username, email, name, avatar_url, bio, website, location, birth_date, gender, is_verified, followers_count, following_count, posts_count"
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error al traer perfil:", error);
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  // Se ejecuta al ganar foco la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholder}>
          Aún no has llenado tu perfil. Completa tu información en "Editar perfil".
        </Text>
        <Button
          title="Editar perfil"
          onPress={() => router.push("/(main)/profile/EditProfile")}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con avatar + nombre */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              profile.avatar_url ||
              "https://ui-avatars.com/api/?name=" + (profile.username || "user"),
          }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>
            {profile.name} {profile.is_verified ? "✔️" : ""}
          </Text>
          <Text style={styles.username}>@{profile.username}</Text>
        </View>
      </View>

      {/* Stats estilo Instagram */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile.posts_count || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile.followers_count || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{profile.following_count || 0}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Bio */}
      {profile.bio ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : (
        <Text style={styles.bioPlaceholder}>Agrega una descripción ✏️</Text>
      )}

      {/* Extra info */}
      <View style={styles.extraInfo}>
        {profile.location && <Text style={styles.info}>📍 {profile.location}</Text>}
        {profile.website && <Text style={styles.info}>🔗 {profile.website}</Text>}
        {profile.gender && <Text style={styles.info}>⚧ {profile.gender}</Text>}
        {profile.birth_date && <Text style={styles.info}>🎂 {profile.birth_date}</Text>}
      </View>

      {/* Botón editar */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push("/(main)/profile/EditProfile")}
      >
        <Text style={styles.editButtonText}>Editar perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginRight: 15 },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: "bold" },
  username: { fontSize: 16, color: "gray" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 14, color: "gray" },
  bio: { fontSize: 16, marginBottom: 15 },
  bioPlaceholder: { fontSize: 14, fontStyle: "italic", color: "gray", marginBottom: 15 },
  extraInfo: { marginBottom: 20 },
  info: { fontSize: 14, marginBottom: 5 },
  editButton: {
    backgroundColor: "#3897f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  editButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  placeholder: {
    fontSize: 16,
    fontStyle: "italic",
    color: "gray",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});
