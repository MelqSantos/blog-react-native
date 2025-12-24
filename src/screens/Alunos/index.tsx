import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../shared/header';

// Definição da Interface do Aluno
interface Aluno {
  id: number;
  user_id: number;
  name: string;
  email: string;
  birth: string;
  username: string;
  role: string;
}

// Ajuste de URL para Android Emulator vs iOS Simulator/Web
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://192.168.15.6:8080';

// Helper para formatar data para exibição (YYYY-MM-DD -> DD/MM/AAAA)
const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '';
  const cleanDate = dateString.split('T')[0];
  if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  }
  return cleanDate;
};

// Helper para formatar data para envio (DD/MM/AAAA -> YYYY-MM-DD)
const formatDateBackend = (dateString: string) => {
  if (!dateString) return '';
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }
  return dateString;
};

export default function AlunosScreen() {
  const [searchValue, setSearchValue] = useState('');
  const [allStudents, setAllStudents] = useState<Aluno[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birth, setBirth] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    fetchStudents(0, true);
  }, []);

  // Filtro local (search)
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredStudents(allStudents);
    } else {
      const lowerSearch = searchValue.toLowerCase();
      const filtered = allStudents.filter(student => 
        student.name.toLowerCase().includes(lowerSearch) ||
        student.email.toLowerCase().includes(lowerSearch) ||
        student.username.toLowerCase().includes(lowerSearch)
      );
      setFilteredStudents(filtered);
    }
  }, [searchValue, allStudents]);

  const fetchStudents = async (pageNumber = 0, shouldRefresh = false) => {
    if (loading) return;
    setLoading(true); 
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Adicionada paginação na URL e filtro por ALUNO
      const response = await fetch(`${BASE_URL}/person/role/ALUNO?page=${pageNumber}&size=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      // Tratativa para garantir que seja um array
      const list = data.content || (Array.isArray(data) ? data : []);
      const isLast = data.last !== undefined ? data.last : list.length < 10;
      
      if (shouldRefresh) {
        setAllStudents(list);
        setPage(0);
      } else {
        setAllStudents(prev => [...prev, ...list]);
        setPage(pageNumber);
      }

      setHasMore(!isLast);

    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      Alert.alert("Erro", `Falha na conexão: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (student?: Aluno) => {
    if (student) {
      setEditingId(student.user_id);
      setName(student.name);
      setEmail(student.email);
      setBirth(formatDateDisplay(student.birth));
      setUsername(student.username);
      setPassword(''); // Senha não é preenchida na edição por segurança
    } else {
      setEditingId(null);
      setName('');
      setEmail('');
      setBirth('');
      setUsername('');
      setPassword('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !username.trim() || !birth.trim() || (editingId === null && !password.trim())) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error("Sessão inválida. Faça login novamente.");

      let url = `${BASE_URL}/user`;
      let method = 'POST';
      let body: any = {};

      if (editingId !== null) {
        // Edição: PUT /user/{id} com payload específico
        url = `${BASE_URL}/user/${editingId}`;
        method = 'PUT';
        body = {
          username,
          role: 'ALUNO',
          name,
          birth: formatDateBackend(birth),
          email
        };
      } else {
        // Inclusão: POST /user com senha
        body = { name, email, birth: formatDateBackend(birth), username, role: 'ALUNO' };
        if (password) {
          body.password = password;
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao salvar aluno");
      }

      setModalVisible(false);
      fetchStudents(0, true); // Recarrega a lista do zero
      Alert.alert("Sucesso", "Aluno salvo com sucesso!");
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível salvar o aluno.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Excluir Aluno",
      "Tem certeza que deseja excluir este aluno?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) throw new Error("Sessão inválida");

              const response = await fetch(`${BASE_URL}/user/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.ok) throw new Error("Erro ao excluir aluno");

              fetchStudents(0, true);
              Alert.alert("Sucesso", "Aluno excluído com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o aluno.");
              console.error(error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Aluno }) => (
    <View style={styles.cardContainer}>
      <View style={styles.headerContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.email}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openModal(item)}>
            <Feather name="edit-2" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.user_id)}>
            <Feather name="trash-2" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Usuário: {item.username}</Text>
        <Text style={styles.infoText}>Nascimento: {formatDateDisplay(item.birth)}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#111827', '#0f172a']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar style="light" />
      <Header />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Text style={styles.screenTitle}>Alunos</Text>
          <Text style={styles.screenSubtitle}>Gerenciamento de discentes</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar aluno"
                placeholderTextColor="#9ca3af"
                value={searchValue}
                onChangeText={setSearchValue}
              />
              <Feather name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
              <Feather name="plus" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {loading && page === 0 && !modalVisible ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhum aluno encontrado.</Text>
              }
              onEndReached={() => {
                if (hasMore && !loading) {
                  fetchStudents(page + 1, false);
                }
              }}
              onEndReachedThreshold={0.1}
              ListFooterComponent={loading && page > 0 ? <ActivityIndicator color="#3b82f6" /> : null}
            />
          )}
        </View>
      </SafeAreaView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Editar Aluno" : "Novo Aluno"}</Text>
            
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput 
                  style={styles.input} 
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
                
                <Text style={styles.label}>Email</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="exemplo@mail.com" 
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Data de Nascimento</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="DD/MM/AAAA" 
                  placeholderTextColor="#9CA3AF"
                  value={birth}
                  onChangeText={setBirth}
                />

                <Text style={styles.label}>Nome de Usuário</Text>
                <TextInput 
                  style={styles.input} 
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                {!editingId && (
                  <>
                    <Text style={styles.label}>Senha</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
                    <Text style={styles.buttonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 16,
    color: '#F9FAFB',
    backgroundColor: '#374151',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
  },
  addButton: {
    marginLeft: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 20,
  },
  cardContainer: {
    flexDirection: 'column',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#60A5FA', // primary-400
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#374151',
    color: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});