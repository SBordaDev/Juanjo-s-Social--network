import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProfileAvatar from "../../components/ProfileAvatar";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase";

type ChatUser = {
  id: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
};

export default function ChatList() {
  const { user } = useAuth();
  const router = useRouter();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      setLoading(true);

      const { data: chats, error } = await supabase
        .from("chats")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Obtener los IDs del otro usuario en cada chat
      const otherUserIds = chats?.map((chat) =>
        chat.user1_id === user.id ? chat.user2_id : chat.user1_id
      );

      // Traer sus perfiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, email, avatar_url")
        .in("id", otherUserIds || []);

      if (profileError) console.error(profileError);
      setChatUsers(profiles || []);
      setLoading(false);
    };

    fetchChats();
  }, [user]);

  const handleOpenChat = (userId: string) => {
    router.push(`/chat/${userId}`); // 👈 luego crearemos esta vista individual
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (chatUsers.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#666" }}>Aún no tienes chats iniciados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>

      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handleOpenChat(item.id)}
          >
            <ProfileAvatar avatarUrl={item.avatar_url} onChangeAvatar={() => {}} />
            <View>
              <Text style={styles.username}>{item.username || item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  username: { fontSize: 16, fontWeight: "500" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
