import { Post } from "@/models/types";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import PostItem from "./PostItem";

export default function ProfilePosts({ posts }: { posts: Post[] }) {
    return (
        <FlatList
        data={posts}
        renderItem={({ item }) => <PostItem item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        />
    );
}

const styles = StyleSheet.create({
    list: {
    width: "100%",
    paddingHorizontal: 5,
    },
});
