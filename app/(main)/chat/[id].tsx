import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../utils/supabase";

type Message = {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: string;
};

export default function ChatScreen() {
    const { id: otherUserId } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // Crear o buscar el chat existente
    useEffect(() => {
    if (!user || !otherUserId) return;

    const getOrCreateChat = async () => {
      // Buscar si ya existe un chat entre ambos
        const { data: existing, error } = await supabase
            .from("chats")
            .select("id")
            .or(
            `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
            )
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error buscando chat:", error);
            return;
        }

        if (existing) {
            setChatId(existing.id);
            return;
        }

        // Si no existe, crear uno nuevo
        const { data: created, error: createError } = await supabase
            .from("chats")
            .insert([{ user1_id: user.id, user2_id: otherUserId }])
            .select("id")
            .single();

        if (createError) console.error("Error creando chat:", createError);
        else setChatId(created.id);
        };

        getOrCreateChat();
    }, [user, otherUserId]);

  // Escuchar mensajes en tiempo real
    useEffect(() => {
        if (!chatId) return;

        const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
            "postgres_changes",
            {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
            if (payload.eventType === "INSERT") {
                setMessages((prev) => [...prev, payload.new as Message]);
                flatListRef.current?.scrollToEnd({ animated: true });
            }
            }
        )
        .subscribe();

    // Cargar mensajes iniciales
    const loadMessages = async () => {
        const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

        if (!error && data) setMessages(data);
    };

    loadMessages();

    return () => {
        supabase.removeChannel(channel);
        };
    }, [chatId]);

    const sendMessage = async () => {
        if (!input.trim() || !chatId || !user) return;

        const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: user.id,
        content: input.trim(),
        });

        if (error) console.error("Error enviando mensaje:", error);
        else setInput("");
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isMine = item.sender_id === user?.id;
        return (
        <View
            style={[
            styles.messageBubble,
            isMine ? styles.myMessage : styles.otherMessage,
            ]}
        >
            <Text style={styles.messageText}>{item.content}</Text>
        </View>
        );
    };

    return (
        <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
        >
        <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
            }
        />

        <View style={styles.inputContainer}>
            <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={input}
            onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Enviar</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 10 },
    messageBubble: {
        maxWidth: "70%",
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#1d3557",
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#457b9d",
    },
    messageText: { color: "#fff" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#ddd",
        padding: 5,
    },
    input: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    sendButton: {
        backgroundColor: "#1d3557",
        marginLeft: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    sendText: { color: "#fff", fontWeight: "bold" },
});
