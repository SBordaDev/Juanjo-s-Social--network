import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase";

type Profile = {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del perfil
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, username, avatar_url, followers_count, following_count")
        .eq("id", user.id)
        .single();
      if (error) console.error(error);
      else setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  // Cerrar sesión
  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  // Cambiar foto
  const handleChangeAvatar = async () => {
    try {
      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Se necesitan permisos para acceder a la galería.");
        return;
      }

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;

      // Convertir a binario
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = imageUri.split(".").pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Subir a Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from("Avatars") // 👈 nombre del bucket
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true, // 👈 permite reemplazar
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage.from("Avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Actualizar en tabla profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev && { ...prev, avatar_url: publicUrl });

      alert("Foto de perfil actualizada ✨");
    } catch (error) {
      console.error("Error cambiando foto:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Foto de perfil */}
      <TouchableOpacity onPress={handleChangeAvatar}>
        <Image
          source={{ uri: profile?.avatar_url ? `${profile.avatar_url}?t=${Date.now()}`: "https://placehold.co/200x200.png", }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Nombre de usuario */}
      <Text style={styles.username}>{profile?.username || profile?.email}</Text>

      {/* Seguidores / Seguidos */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{profile?.followers_count ?? 0}</Text>
          <Text style={styles.statLabel}>Seguidores</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{profile?.following_count ?? 0}</Text>
          <Text style={styles.statLabel}>Seguidos</Text>
        </View>
      </View>

      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", paddingTop: 60 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  username: { fontSize: 20, fontWeight: "bold", marginBottom: 24 },
  statsContainer: { flexDirection: "row", marginBottom: 40 },
  stat: { alignItems: "center", marginHorizontal: 20 },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 14, color: "#555" },
  logoutButton: { backgroundColor: "#E63946", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
