import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
    avatarUrl: string | null;
    onChangeAvatar: () => void;
};

export default function ProfileAvatar({ avatarUrl, onChangeAvatar }: Props) {
    return (
        <TouchableOpacity onPress={onChangeAvatar}>
        <Image
            source={{
            uri: avatarUrl
                ? `${avatarUrl}?t=${Date.now()}`
                : "https://placehold.co/200x200.png",
            }}
            style={styles.avatar}
        />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e6e6e6",
    },
});
