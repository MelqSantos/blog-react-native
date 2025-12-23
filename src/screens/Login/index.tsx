import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import Header from '../../shared/header';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definição dos tipos para o formulário
interface FormState {
  username: string;
  password: string;
  role: 'PROFESSOR' | 'ALUNO';
  name: string;
  birth: string;
  email: string;
}

const initialForm: FormState = { 
  username: '', 
  password: '', 
  role: 'ALUNO', // Valor padrão seguro
  name: '',
  birth: '',
  email: ''
};

// Configuração da URL da API
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://192.168.15.6:8080';

export default function Login() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Função genérica para atualizar campos do formulário
  const handleChange = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Validação básica
    if (!form.username || !form.password) {
      Alert.alert('Erro', 'Preencha usuário e senha.');
      setLoading(false);
      return;
    }

    if (isRegister && (!form.name || !form.email)) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/user' : '/user/signin';
      const url = `${BASE_URL}${endpoint}`;

      const body = isRegister
        ? { ...form } // Envia tudo no cadastro
        : { username: form.username, password: form.password }; // Apenas credenciais no login

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}: Falha na solicitação`);
      }

      if (isRegister) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Faça login para continuar.');
        setIsRegister(false);
        setForm(initialForm);
      } else {
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
          if (data.id) {
            await AsyncStorage.setItem('id', String(data.id));
          }
          navigation.navigate('Posts' as never);
        } else {
          throw new Error('Token de autenticação não recebido.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#111827', '#0f172a']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar style="light" />
      <Header/>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <Text style={styles.title}>
              {isRegister ? 'Cadastro' : 'Login'}
            </Text>
            <Text style={styles.subtitle}>
              {isRegister 
                ? 'Crie sua conta para acessar o Blog Academy.' 
                : 'Bem-vindo de volta!'}
            </Text>

            {/* Seletor de Role (Apenas no Cadastro) */}
            {isRegister && (
              <View style={styles.roleContainer}>
                <Text style={styles.label}>Tipo de usuário</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity 
                    style={[styles.roleButton, form.role === 'PROFESSOR' && styles.roleButtonActive]}
                    onPress={() => handleChange('role', 'PROFESSOR')}
                  >
                    <Text style={[styles.roleText, form.role === 'PROFESSOR' && styles.roleTextActive]}>PROFESSOR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.roleButton, form.role === 'ALUNO' && styles.roleButtonActive]}
                    onPress={() => handleChange('role', 'ALUNO')}
                  >
                    <Text style={[styles.roleText, form.role === 'ALUNO' && styles.roleTextActive]}>ALUNO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Campos de Cadastro Extras */}
            {isRegister && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(text) => handleChange('name', text)}
                    placeholder="Seu nome"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Data de Nascimento</Text>
                  <TextInput
                    style={styles.input}
                    value={form.birth}
                    onChangeText={(text) => handleChange('birth', text)}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numbers-and-punctuation"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={form.email}
                    onChangeText={(text) => handleChange('email', text)}
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </>
            )}

            {/* Campos Padrão (Login e Cadastro) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuário</Text>
              <TextInput 
                style={styles.input}
                onChangeText={(text) => handleChange('username', text)}
                value={form.username}
                autoCapitalize="none"
                placeholder="Digite seu usuário"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput 
                secureTextEntry={true} 
                style={styles.input}
                onChangeText={(text) => handleChange('password', text)}
                value={form.password}
                placeholder="Digite sua senha"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSubmit} 
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {isRegister ? 'Cadastrar' : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => {
                setIsRegister(!isRegister);
                setForm(initialForm); // Limpa form ao trocar
              }}
            >
              <Text style={styles.toggleText}>
                {isRegister 
                  ? 'Já tem uma conta? Faça login' 
                  : 'Não tem conta? Cadastre-se'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>     
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 25,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB', // gray-50
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF', // gray-400
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB', // gray-300
    marginBottom: 6,
  },
  input: {
    height: 45,
    borderColor: '#4B5563', // gray-600
    borderWidth: 1,
    paddingHorizontal: 12,
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#374151', // gray-700
    color: '#F9FAFB',
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 6,
    overflow: 'hidden',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  roleButtonActive: {
    backgroundColor: '#3B82F6', // primary-500 equivalent
  },
  roleText: {
    color: '#D1D5DB',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#3B82F6', // primary-500
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#3B82F6',
    fontSize: 14,
  },
});
