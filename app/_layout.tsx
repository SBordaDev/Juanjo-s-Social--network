// app/_layout.tsx  (RootLayout)
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext"; // ajusta la ruta según tu estructura

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </AuthProvider>
  );
}
