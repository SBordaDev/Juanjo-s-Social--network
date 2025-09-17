import { Link } from 'expo-router'
import React from 'react'
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Welcome() {
  return (
    <ImageBackground
      source={require('../../assets/images/space-bg.png')} // 👈 ruta corregida
      style={styles.container}
    >
      <View style={styles.overlay}>
        {/* Nombres estilo galáctico */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText1}></Text>
          <Text style={styles.logoText2}></Text>
        </View>

        {/* Botones en la parte inferior */}
        <View style={styles.buttonContainer}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Registrarse</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between', // 👈 esto deja espacio libre al centro
    alignItems: 'center',
    paddingVertical: 60, // da aire arriba y abajo
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoText1: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ff7675', // rojo/naranja espacial
  },
  logoText2: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#a29bfe', // morado espacial
  },
  buttonContainer: {
    width: 220,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
