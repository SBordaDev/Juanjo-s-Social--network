import ProfileAvatar from "@/components/ProfileAvatar"; //componente de la foto de avatar
import ProfilePosts from "@/components/ProfilePost"; //componente para visualizar los post
import ProfileStats from "@/components/ProfileStats"; //componente de seguidores y seguidos
import useAvatarUpload from "@/hooks/UseAvatarUpload"; //codigo para actualizar la foto de perfil
import { Post, Profile } from "@/models/types"; //tipos de post y profile para la base de datos

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleChangeAvatar, uploading} = useAvatarUpload(user, setProfile); 

  // Cargar datos del perfil
  useEffect(() => {
    if (!user) return;
    const fetchProfileAndPosts = async () => {
      setLoading(true);
            const [{ data: profileData, error: profileError }, { data: postsData, error: postsError }] =
            await Promise.all([
              supabase
                .from("profiles")
                .select("id, email, username, avatar_url, followers_count, following_count")
                .eq("id", user.id)
                .single(),
              supabase
                .from("posts")
                .select("id, content, media_url, media_type, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
            ]);

      if (profileError) console.error(profileError);
      else setProfile(profileData);

      if (postsError) console.error(postsError);
      else setPosts(postsData || []);

      setLoading(false);
    };

    fetchProfileAndPosts();
  }, [user]);

  // Cerrar sesión
  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
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
      <ProfileAvatar avatarUrl={profile?.avatar_url ?? null} onChangeAvatar={handleChangeAvatar} />
      {uploading && <Text>Subiendo...</Text>}
      <Text style={styles.username}>{profile?.username || profile?.email}</Text>
      <ProfileStats followers={profile?.followers_count ?? 0} following={profile?.following_count ?? 0} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
      <Text style={styles.subtext}>Tus Post</Text>
      <ProfilePosts posts={posts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    paddingTop: 50,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#222",
  },
  subtext: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 15,
    color: "#333",
    alignSelf: "flex-start",
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: "#E63946",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 18,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
