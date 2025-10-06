import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    followers: number;
    following: number;
};

export default function ProfileStats({ followers, following }: Props) {
    return (
        <View style={styles.statsContainer}>
        <View style={styles.stat}>
            <Text style={styles.statNumber}>{followers}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
        </View>
        <View style={styles.stat}>
            <Text style={styles.statNumber}>{following}</Text>
            <Text style={styles.statLabel}>Seguidos</Text>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    },
    stat: {
        alignItems: "center",
        marginHorizontal: 25,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
    statLabel: {
        fontSize: 13,
        color: "#555",
    },
});
