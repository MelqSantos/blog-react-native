import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Verifica se a rota atual é 'Login' (case insensitive para segurança)
  const isLogin = route.name.toLowerCase() === 'login';

  const handleLogout = () => {
    Alert.alert("Sair", "Sessão encerrada.");
    navigation.navigate('Login' as never);
  };

return(
  <View style={styles.header}>
    <TouchableOpacity 
      style={styles.logoContainer}
      disabled={isLogin}
      onPress={() => navigation.navigate('home' as never)}
    >
      <Ionicons name="school" size={28} color="#3B82F6" />
      <Text style={styles.headerText}>Blog academy</Text>
    </TouchableOpacity>

    <View style={styles.actions}>
      {/* Botão de Tema (Visual) */}
      {/* <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="sunny-outline" size={24} color="#F9FAFB" />
      </TouchableOpacity> */}

      {/* Botão de Logout (Apenas se não estiver no Login) */}
      {!isLogin && (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
          <Ionicons name="log-out-outline" size={24} color="#F9FAFB" />
        </TouchableOpacity>
      )}
    </View>
  </View>
)
}

const styles = StyleSheet.create({
  header:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    backgroundColor: '#111827',
    paddingHorizontal: 16,  
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontWeight: '800',
    fontSize: 20,
    color: '#F9FAFB',
    letterSpacing: -0.5
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  }
})