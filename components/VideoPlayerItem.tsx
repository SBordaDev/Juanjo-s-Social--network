import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet } from "react-native";

export default function VideoPlayerItem({ uri }: { uri: string }){
    const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 100;
    p.pause();
    });

    return (
        <VideoView
        player={player}
        style={styles.postMedia}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="cover"
        />
    );
}

const styles = StyleSheet.create({
    postMedia: { width: "100%", height: 250, backgroundColor: "#eee" },
})