import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet } from "react-native";

export default function VideoPlayerItem({ uri }: { uri: string }){
    const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 0;
    p.play() 
    });

    return (
        <VideoView
        player={player}
        style={styles.postMedia}
        nativeControls
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain" 
        />
    );
}

const styles = StyleSheet.create({
    postMedia: { width: "100%", height: 250, borderRadius: 10, backgroundColor: "#eee" },
})