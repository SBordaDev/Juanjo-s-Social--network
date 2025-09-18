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
import { supabase } from "../../utils/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"hombre" | "mujer" | null>(null);
  const [birthDate, setBirthDate] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !fullName || !username || !gender || !birthDate) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      // Registro con Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const user = data.user;
      if (!user) throw new Error("No se pudo obtener el usuario");

      // Insertar datos adicionales en la tabla profiles
      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email,
          name: fullName,
          username,
          gender,
          birth_date: birthDate,
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
        <Text style={styles.subtitle}>
          Regístrate con tu correo y contraseña
        </Text>

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

          <Text style={styles.label}>Género</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                gender === "hombre" && styles.radioSelected,
              ]}
              onPress={() => setGender("hombre")}
            >
              <Text style={styles.radioText}>Hombre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                gender === "mujer" && styles.radioSelected,
              ]}
              onPress={() => setGender("mujer")}
            >
              <Text style={styles.radioText}>Mujer</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD"
            value={birthDate}
            onChangeText={setBirthDate}
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
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
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    padding: 20,
  },
  content: { maxWidth: 400, alignSelf: "center", width: "100%" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 32,
  },
  form: { marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#000" },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  radioButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  radioSelected: { backgroundColor: "#2ecc71" },
  radioText: { fontSize: 16 },
  registerButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  registerButtonText: { color: "#120202", fontSize: 16, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "#000", fontSize: 14 },
  loginLink: { color: "#3498db", fontSize: 14, fontWeight: "600" },
});
