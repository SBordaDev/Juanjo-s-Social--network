import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase";

/* Tipos normalizados que usaremos en la UI */
type ProfileObj = {
  id: string;
  username: string | null;
  avatar_url: string | null;
} | null;

type Comment = {
  content: string;
  profiles: ProfileObj;
};

type Post = {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  profiles: ProfileObj; // autor normalizado a objeto (no array)
  post_likes: { user_id: string }[];
  post_comments: Comment[];
};

"sendComment"
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comment, setComment] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      setFollowing(data?.map((f) => f.following_id) || []);
    })();
  }, [user]);

  const toggleFollow = async (targetId: string) => {
    if (!user) return;
  const isFollowing = following.includes(targetId);

  if (isFollowing) {
    // 🔸 Dejar de seguir
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);

    if (!error) {
      // 🔹 Restar contadores
      await supabase.rpc("decrement_follow_counts", {
        follower_id: user.id,
        following_id: targetId,
      });
      setFollowing((prev) => prev.filter((id) => id !== targetId));
    }
  } else {
    // 🔸 Empezar a seguir
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetId });

    if (!error) {
      // 🔹 Sumar contadores
      await supabase.rpc("increment_follow_counts", {
        follower_id: user.id,
        following_id: targetId,
      });
      setFollowing((prev) => [...prev, targetId]);
    }
  }
  };


  // Carga posts y normaliza la forma de los datos
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id, user_id, content, media_url, media_type, created_at,
          profiles ( id, username, avatar_url ),
          post_likes ( user_id ),
          post_comments ( content, profiles ( id, username ) )
        `
        )
        .neq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando posts:", error);
        setLoading(false);
        return;
      }

      // Normalizar la respuesta para que 'profiles' sea un objeto y no un array
      const normalized: Post[] = (data || []).map((p: any) => {
        const profileObj: ProfileObj = Array.isArray(p.profiles)
          ? p.profiles[0] ?? null
          : p.profiles ?? null;

        const comments: Comment[] = (p.post_comments || []).map((c: any) => {
          const cProfile: ProfileObj = Array.isArray(c.profiles)
            ? c.profiles[0] ?? null
            : c.profiles ?? null;
          return {
            content: c.content,
            profiles: cProfile,
          };
        });

        return {
          id: p.id,
          user_id: p.user_id,
          content: p.content,
          media_url: p.media_url,
          media_type: p.media_type,
          created_at: p.created_at,
          profiles: profileObj,
          post_likes: p.post_likes || [],
          post_comments: comments,
        };
      });

      setPosts(normalized);
      setLoading(false);
    };

    loadPosts();
  }, []);

  // toggle like (crear o eliminar)
  const toggleLike = async (postId: string, liked: boolean) => {
    if (!user) return;

    if (liked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
      });
    }

    // Actualizar estado local
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              post_likes: liked
                ? p.post_likes.filter((l) => l.user_id !== user.id)
                : [...p.post_likes, { user_id: user.id }],
            }
          : p
      )
    );
  };

  // enviar comentario
  const sendComment = async (postId: string, text: string) => {
    if (!text.trim() || !user) return;

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    user_id: user.id,
    content: text.trim(),
  });

  if (error) {
    Alert.alert("Error", error.message);
    return;
  }

  setPosts((prev) =>
    prev.map((p) =>
      p.id === postId
        ? {
            ...p,
            post_comments: [
              ...p.post_comments,
              { content: text.trim(), profiles: { id: user.id, username: "Tú", avatar_url: null } },
            ],
          }
        : p
    )
  );

  // Limpia solo el input del post actual
  setComment((prev) => ({ ...prev, [postId]: "" }));
  };

  // iniciar chat (buscar o crear)
  const handleStartChat = async (otherUserId: string) => {
    if (!user) return;
    if (otherUserId === user.id) return Alert.alert("No puedes chatear contigo mismo 😅");

    const { data: existing, error } = await supabase
      .from("chats")
      .select("id")
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
      )
      .single();

    if (existing) router.push(`/chat/${otherUserId}`);
    else {
      const { error: createError } = await supabase
        .from("chats")
        .insert([{ user1_id: user.id, user2_id: otherUserId }]);
      if (createError) Alert.alert("Error", createError.message);
      else router.push(`/chat/${otherUserId}`);
    }
  };

  // Componente auxiliar para reproducir video (hook en nivel de componente)
  function VideoItem({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (p) => {
      p.loop = true;
      p.volume = 0;

      // p.play() puede devolver void o una Promise dependiendo de la implementación.
      // Manejarlo de forma segura:
      try {
        const maybePromise: any = p.play?.();
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.catch(() => {});
        }
      } catch (e) {
        // ignorar errores de ejecución síncrona
        console.warn("No se pudo iniciar reproducción automáticamente:", e);
      }
    });

    return (
      <VideoView
        player={player}
        style={styles.postMedia}
        nativeControls
        allowsFullscreen
        allowsPictureInPicture
        contentFit="cover"
      />
    );
  }

  // render de cada post
  const renderPost = ({ item }: { item: Post }) => {
    const liked = item.post_likes.some((l) => l.user_id === user?.id);

    return (
      <View style={styles.postContainer}>
        {/* Cabecera */}
        <View style={styles.postHeader}>
          <Image
            source={{
              uri: item.profiles?.avatar_url || "https://placehold.co/60x60.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.profiles?.username || "Usuario"}</Text>
          <TouchableOpacity style={styles.chatButton} onPress={() => handleStartChat(item.user_id)}>
            <Text style={styles.chatText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.followButton, following?.includes(item.user_id) && { backgroundColor: "#ddd" }]}
            onPress={() => toggleFollow(item.user_id)}
          >
            <Text style={styles.followText}>
              {following?.includes(item.user_id) ? "Siguiendo" : "Seguir"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Media */}
        {item.media_type === "video" && item.media_url ? (
          <VideoItem uri={item.media_url} />
        ) : item.media_type === "image" && item.media_url ? (
          <Image source={{ uri: item.media_url }} style={styles.postMedia} />
        ) : null}

        {/* Texto */}
        {item.content ? <Text style={styles.postText}>{item.content}</Text> : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleLike(item.id, liked)}>
            <Text style={[styles.like, liked && { color: "#e63946" }]}>
              ❤️ {item.post_likes.length}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comentarios */}
        <View style={styles.comments}>
          {item.post_comments.map((c, i) => (
            <Text key={i} style={styles.comment}>
              <Text style={{ fontWeight: "bold" }}>
                {c.profiles?.username || "Usuario"}:{" "}
              </Text>
              {c.content}
            </Text>
          ))}

          <View style={styles.commentInputContainer}>
            <TextInput
              value={comment[item.id] || ""}
              onChangeText={(text) => setComment((prev) => ({ ...prev, [item.id]: text }))}
              placeholder="Escribe un comentario..."
              style={styles.commentInput}
            />
            <TouchableOpacity onPress={() => sendComment(item.id, comment[item.id] || "")}>
              <Text style={styles.commentSend}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Cargando posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio</Text>
      <FlatList data={posts} renderItem={renderPost} keyExtractor={(item) => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 10 },
  postContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  postHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontWeight: "bold", flex: 1 },
  chatButton: { paddingHorizontal: 8 },
  chatText: { fontSize: 18 },
  postMedia: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    backgroundColor: "#eee",
    marginTop: 10,
  },
  postText: { marginTop: 8, fontSize: 15 },
  actions: { flexDirection: "row", marginTop: 8 },
  like: { fontSize: 16, fontWeight: "bold", color: "#555" },
  comments: { marginTop: 10 },
  comment: { fontSize: 13, marginBottom: 4 },
  commentInputContainer: { flexDirection: "row", alignItems: "center" },
  commentInput: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 5,
  },
  commentSend: { color: "#1d3557", fontWeight: "bold" },
  followButton: {
  backgroundColor: "#1d3557",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 6,
  marginLeft: 8,
},
followText: { color: "#fff", fontWeight: "600" },
});
