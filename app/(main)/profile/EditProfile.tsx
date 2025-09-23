import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../utils/supabase";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio, website, location, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setUsername(data.username || "");
        setBio(data.bio || "");
        setWebsite(data.website || "");
        setLocation(data.location || "");
        setAvatar(data.avatar_url || null);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    let avatar_url = avatar;

    // 🚀 Subir a Supabase Storage si es una nueva imagen local
    if (avatar && avatar.startsWith("file://")) {
      const ext = avatar.split(".").pop();
      const fileName = `${user.id}.${ext}`;
      const filePath = `avatars/${fileName}`;

      const response = await fetch(avatar);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
      } else {
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }
    }

    const updates = {
      username,
      bio,
      website,
      location,
      avatar_url,
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", "No se pudo guardar tu perfil");
      console.error(error);
    } else {
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      router.push("../(main)/profile");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={{ color: "#aaa" }}>No avatar</Text>
          </View>
        )}
        <View style={styles.avatarButtons}>
          <TouchableOpacity style={styles.avatarButton} onPress={handleTakePhoto}>
            <Text style={styles.avatarButtonText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton} onPress={handlePickImage}>
            <Text style={styles.avatarButtonText}>🖼️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Tu username"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={bio}
        onChangeText={setBio}
        placeholder="Agrega una descripción"
        multiline
      />

      <Text style={styles.label}>Website</Text>
      <TextInput
        style={styles.input}
        value={website}
        onChangeText={setWebsite}
        placeholder="Tu link"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Ciudad / País"
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16 },
  saveButton: { backgroundColor: "#3897f0", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 20 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarContainer: { alignItems: "center", marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },
  avatarButtons: { flexDirection: "row", marginTop: 10 },
  avatarButton: { marginHorizontal: 10, backgroundColor: "#3897f0", padding: 10, borderRadius: 30 },
  avatarButtonText: { color: "#fff", fontSize: 18 },
});
