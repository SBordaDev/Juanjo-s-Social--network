// app/(main)/post.tsx
import VideoPlayerItem from "@/components/VideoPlayerItem";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase";

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<{ uri: string; type: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  // El ref ya no es necesario para esta implementación
  // const videoRef = useRef<Video>(null); 

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      setMedia({ uri: file.uri, type: file.type ?? "image" });
    } catch (error) {
      Alert.alert(
        "Error al seleccionar",
        "No se pudo seleccionar el archivo. Por favor, revisa los permisos de la aplicación."
      );
    }
  };

  const handlePost = async () => {
    if (!user) return;
    if (!content.trim() && !media) {
      Alert.alert("Vacío", "No puedes crear una publicación vacía.");
      return;
    }
    setLoading(true);

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (media) {
      const response = await fetch(media.uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = media.uri.split(".").pop()?.toLowerCase();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const contentType =
        media.type === "video" ? `video/${fileExt}` : `image/${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, arrayBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        Alert.alert("Error subiendo media", uploadError.message);
        setLoading(false);
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

    setLoading(false);

    if (error) {
      Alert.alert("Error creando post", error.message);
    } else {
      Alert.alert("¡Éxito!", "Tu publicación ha sido creada 🎉");
      setContent("");
      setMedia(null);
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="¿Qué estás pensando?"
        value={content}
        onChangeText={setContent}
        multiline
      />

      {media && (
        <View style={styles.previewContainer}>
          {media.type === "video" ? (
            <VideoPlayerItem uri={media.uri}/>
          ) : (
            <Image source={{ uri: media.uri }} style={styles.preview} />
          )}
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => setMedia(null)}
          >
            <Text style={styles.removeMediaText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
        <Text style={styles.buttonText}>
          {media ? "Cambiar Imagen/Video" : "Elegir Imagen/Video"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.postButton, loading && styles.disabledButton]}
        onPress={handlePost}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.postButtonText}>Publicar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccd0d5",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 15,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 16,
    marginBottom: 20,
  },
  previewContainer: {
    position: "relative",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#e4e6eb",
  },
  removeMediaButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  removeMediaText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  mediaButton: {
    backgroundColor: "#e8f0fe",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#4a90e2",
  },
  postButton: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a4c5e6",
  },
  buttonText: {
    color: "#4a90e2",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  postButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});