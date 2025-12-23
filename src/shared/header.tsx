import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  const navigation = useNavigation();
  const route = useRoute();
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Verifica se a rota atual é 'Login' (case insensitive para segurança)
  const isLogin = route.name.toLowerCase() === 'login';

  const handleLogout = () => {
    Alert.alert("Sair", "Sessão encerrada.");
    navigation.navigate('Login' as never);
  };

return(
  <View style={[styles.header, { zIndex: 10 }]}>
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
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.iconButton}>
          <Ionicons name={menuVisible ? "close" : "menu"} size={30} color="#F9FAFB" />
        </TouchableOpacity>
      )}
    </View>

    {/* Menu Dropdown (Toggle) */}
    {menuVisible && !isLogin && (
      <View style={styles.menuOverlay}>
        <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate('Professores' as never); }} style={styles.menuItem}>
          <Ionicons name="easel-outline" size={24} color="#F9FAFB" />
          <Text style={styles.menuText}>Professores</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate('Alunos' as never); }} style={styles.menuItem}>
          <Ionicons name="people-outline" size={24} color="#F9FAFB" />
          <Text style={styles.menuText}>Alunos</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMenuVisible(false); handleLogout(); }} style={styles.menuItem}>
          <Ionicons name="log-out-outline" size={24} color="#F9FAFB" />
          <Text style={styles.menuText}>Sair</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
)
}

const styles = StyleSheet.create({
  header:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 90,
    paddingTop: 30,
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
  },
  menuOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#1F2937',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  menuText: {
    fontSize: 18,
    color: '#F9FAFB',
    fontWeight: '500',
  }
})