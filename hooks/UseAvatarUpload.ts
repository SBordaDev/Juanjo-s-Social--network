import { Profile } from "@/models/types";
import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export default function useAvatarUpload(user: any, setProfile: React.Dispatch<React.SetStateAction<Profile | null>>) {
    const [uploading, setUploading] = useState(false);

    const handleChangeAvatar = async () => {
        try {
        setUploading(true);

        // 1. Pedir permisos
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Se necesitan permisos para acceder a la galería.");
            return;
        }

        // 2. Abrir galería
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        const imageUri = result.assets[0].uri;

        // 3. Convertir a binario
        const response = await fetch(imageUri);
        const arrayBuffer = await response.arrayBuffer();
        const fileExt = imageUri.split(".").pop();
        const filePath = `${user?.id}/avatar.${fileExt}`;

        // 4. Subir a Supabase Storage
        let { error: uploadError } = await supabase.storage
            .from("Avatars")
            .upload(filePath, arrayBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
            });

        if (uploadError) throw uploadError;

        // 5. Obtener URL pública
        const { data } = supabase.storage.from("Avatars").getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        // 6. Actualizar en tabla profiles
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", user?.id);

        if (updateError) throw updateError;

        // 7. Actualizar estado
        setProfile((prev) => prev && { ...prev, avatar_url: publicUrl });

        alert("Foto de perfil actualizada ✨");
        } catch (error) {
        console.error("Error cambiando foto:", error);
        } finally {
        setUploading(false);
        }
    };

    return { handleChangeAvatar, uploading };
}
