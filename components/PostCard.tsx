import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import VideoPlayerItem from "./VideoPlayerItem"; // Usamos tu componente de video

type PostCardProps = {
    post: Post;
    currentUserId?: string;
    onToggleLike: (postId: string, liked: boolean) => void;
    onSendComment: (postId: string, comment: string) => void;
    onStartChat: (otherUserId: string) => void;
};

type Post = {
    id: string;
    user_id: string;
    content: string | null;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
    profiles: {
        id: string;
        username: string | null;
        avatar_url: string | null;
    } | null; // <-- AQUÍ ESTÁ LA CORRECCIÓN
    post_likes: { user_id: string }[];
    post_comments: { content: string; profiles: { username: string | null } }[];
};

export default function PostCard({
    post,
    currentUserId,
    onToggleLike,
    onSendComment,
    onStartChat,
    }: PostCardProps) {
    const [comment, setComment] = useState("");
    const isLiked = post.post_likes.some((l) => l.user_id === currentUserId);

    const handleSendComment = () => {
        if (!comment.trim()) return;
        onSendComment(post.id, comment);
        setComment(""); // Limpiar el input después de enviar
    };

    return (
        <View style={styles.postContainer}>
        {/* Cabecera del Post */}
        <View style={styles.postHeader}>
            <Image
            source={{
                uri: post.profiles?.avatar_url || "https://placehold.co/60x60.png",
            }}
            style={styles.avatar}
            />
            <Text style={styles.username}>{post.profiles?.username || "Usuario"}</Text>
            {currentUserId !== post.user_id && (
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => onStartChat(post.user_id)}
                >
                    <Text style={styles.chatText}>💬</Text>
                </TouchableOpacity>
            )}
        </View>

        {/* Contenido Multimedia */}
        {post.media_type === "video" && post.media_url ? (
            <VideoPlayerItem uri={post.media_url} /> // Reemplazamos con tu componente
        ) : post.media_type === "image" && post.media_url ? (
            <Image source={{ uri: post.media_url }} style={styles.postMedia} />
        ) : null}

        {/* Texto del Post */}
        {post.content ? <Text style={styles.postText}>{post.content}</Text> : null}

        {/* Acciones (Like) */}
        <View style={styles.actions}>
            <TouchableOpacity onPress={() => onToggleLike(post.id, isLiked)}>
            <Text style={[styles.like, isLiked && { color: "#e63946" }]}>
                ❤️ {post.post_likes.length}
            </Text>
            </TouchableOpacity>
        </View>

        {/* Comentarios */}
        <View style={styles.comments}>
            {post.post_comments.map((c, i) => (
            <Text key={i} style={styles.comment}>
                <Text style={{ fontWeight: "bold" }}>
                {c.profiles?.username || "Usuario"}:{" "}
                </Text>
                {c.content}
            </Text>
            ))}
            <View style={styles.commentInputContainer}>
            <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Escribe un comentario..."
                style={styles.commentInput}
            />
            <TouchableOpacity onPress={handleSendComment}>
                <Text style={styles.commentSend}>Enviar</Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
    );
}

// Los estilos son los mismos que tenías en tu index.tsx para un post
const styles = StyleSheet.create({
    postContainer: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 10, marginBottom: 20 },
    postHeader: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    username: { fontWeight: "bold", flex: 1 },
    chatButton: { paddingHorizontal: 8 },
    chatText: { fontSize: 18 },
    postMedia: { width: "100%", height: 250, borderRadius: 10, backgroundColor: "#eee", marginTop: 10 },
    postText: { marginTop: 8, fontSize: 15 },
    actions: { flexDirection: "row", marginTop: 8 },
    like: { fontSize: 16, fontWeight: "bold", color: "#555" },
    comments: { marginTop: 10 },
    comment: { fontSize: 13, marginBottom: 4 },
    commentInputContainer: { flexDirection: "row", alignItems: "center" },
    commentInput: { flex: 1, backgroundColor: "#f2f2f2", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, marginRight: 5 },
    commentSend: { color: "#1d3557", fontWeight: "bold" },
});