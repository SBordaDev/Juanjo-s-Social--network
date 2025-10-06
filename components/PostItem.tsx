import VideoPlayerItem from "@/components/VideoPlayerItem";
import { Post } from "@/models/types";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

export default function PostItem({ item }: { item: Post }) {

    if (!item.media_url) return null;

    return (
        <View style={styles.postContainer}>
        {item.media_type === "video" ? (
            <VideoPlayerItem uri={item.media_url}/>
        ) : (
            <Image source={{ uri: item.media_url }} style={styles.postMedia} />
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    postContainer: {
    flexBasis: "32%",
    aspectRatio: 0.48,
    margin: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#eee",
    },
    postMedia: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    videoWrapper: {
        flex: 1,
        position: "relative",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.25)",
    },
});
