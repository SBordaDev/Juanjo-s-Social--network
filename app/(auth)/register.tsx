import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !fullName || !username) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      // 1. Crear usuario en Auth
      await signUpWithEmail(email, password);

      // 2. Obtener el user.id recién creado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se pudo obtener el usuario");

      // 3. Insertar en la tabla `profiles`
      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: fullName,
          username: username,
        },
      ]);

      if (error) throw error;

      Alert.alert("Éxito", "Cuenta creada 🎉\nVerifica tu correo para confirmarla.");
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear la cuenta");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate con tu correo y contraseña</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", justifyContent: "center", padding: 20 },
  content: { maxWidth: 400, alignSelf: "center", width: "100%" },
  title: { fontSize: 28, fontWeight: "bold", color: "#000000ff", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#7f8c8d", textAlign: "center", marginBottom: 32 },
  form: { marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: "#000000ff", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: "#fff",
    marginBottom: 16
  },
  registerButton: { backgroundColor: "#2ecc71", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  registerButtonText: { color: "#120202ff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { color: "#000000ff", fontSize: 14 },
  loginLink: { color: "#3498db", fontSize: 14, fontWeight: "600" },
});
