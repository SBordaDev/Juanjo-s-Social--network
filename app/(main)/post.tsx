// app/(main)/post.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase";

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<{ uri: string; type: string } | null>(null);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;
    const file = result.assets[0];
    setMedia({ uri: file.uri, type: file.type ?? "image" });
  };

  const handlePost = async () => {
    if (!user) return;
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (media) {
      const response = await fetch(media.uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = media.uri.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, arrayBuffer, {
          contentType: media.type === "video" ? `video/${fileExt}` : `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        Alert.alert("Error subiendo media", uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
      mediaUrl = data.publicUrl;
      mediaType = media.type === "video" ? "video" : "image";
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content,
      media_url: mediaUrl,
      media_type: mediaType,
    });

    if (error) {
      Alert.alert("Error creando post", error.message);
    } else {
      Alert.alert("Publicado 🎉");
      setContent("");
      setMedia(null);
      router.replace("/(main)/index"); 
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Escribe algo..."
        value={content}
        onChangeText={setContent}
      />

      <TouchableOpacity style={styles.button} onPress={pickMedia}>
        <Text style={styles.buttonText}>Elegir Imagen/Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#457b9d",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#1d3557",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
