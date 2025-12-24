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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../shared/header';

// Definição da Interface do Post
interface Post {
  id: string;
  title: string;
  content: string;
  subject: string;
  createdat: string;
  updatedat: string;
  author_id: number;
  author: string;
}

// Ajuste de URL para Android Emulator vs iOS Simulator/Web
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://192.168.15.6:8080';

export default function PostsScreen() {
  const [searchValue, setSearchValue] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  
  // Simulação de role para manter a lógica visual do botão de adicionar
  const isProfessor = true; 

  const navigation = useNavigation();

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filtro local (search)
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredPosts(allPosts);
    } else {
      const lowerSearch = searchValue.toLowerCase();
      const filtered = allPosts.filter(post => 
        post.title.toLowerCase().includes(lowerSearch) ||
        post.content.toLowerCase().includes(lowerSearch) ||
        post.subject.toLowerCase().includes(lowerSearch)
      );
      setFilteredPosts(filtered);
    }
  }, [searchValue, allPosts]);

  const fetchPosts = async () => {
    setLoading(true);
    console.log(`url: ${BASE_URL}/posts`)
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const response = await fetch(`${BASE_URL}/posts`, {
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
      // Tratativa para garantir que seja um array.
      const postsArray = Array.isArray(data) ? data : Array.isArray(data.posts) ? data.posts : [];
      
      setAllPosts(postsArray);
      setFilteredPosts(postsArray);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      Alert.alert("Erro", `Falha na conexão: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (post?: Post) => {
    if (post) {
      setEditingId(post.id);
      setTitle(post.title);
      setSubject(post.subject);
      setContent(post.content);
    } else {
      setEditingId(null);
      setTitle('');
      setSubject('');
      setContent('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const storedId = await AsyncStorage.getItem('id');

      if (!token || !storedId) throw new Error("Sessão inválida. Faça login novamente.");
      const author_id = Number(storedId);

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${BASE_URL}/posts/${editingId}` : `${BASE_URL}/posts`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, subject, content, author_id })
      });

      if (!response.ok) throw new Error("Erro ao salvar post");

      setModalVisible(false);
      fetchPosts(); // Atualiza a lista
      Alert.alert("Sucesso", "Post salvo com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o post.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Post",
      "Tem certeza que deseja excluir este post?",
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

              const response = await fetch(`${BASE_URL}/posts/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.ok) throw new Error("Erro ao excluir post");

              fetchPosts();
              Alert.alert("Sucesso", "Post excluído com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o post.");
              console.error(error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      {/* Título e Tags */}
      <View style={styles.headerContent}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => console.log(`Navegar para post ${item.id}`)}>
            <Text style={styles.postTitle}>{item.title}</Text>
          </TouchableOpacity>
          
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.subject.toUpperCase()}</Text>
          </View>
        </View>

        {/* Ações (Editar/Excluir) - Visível apenas se professor */}
        {isProfessor && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => openModal(item)}>
              <Feather name="edit-2" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
              <Feather name="trash-2" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Conteúdo (Resumo) */}
      <Text style={styles.postContent}>
        {item.content}
      </Text>

      {/* Data */}
      <Text style={styles.dateText}>
        {new Date(item.updatedat).toLocaleString()} • {item.author}
      </Text>
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
        {/* Header da Tela */}
        <Text style={styles.screenTitle}>Blog</Text>
        <Text style={styles.screenSubtitle}>Últimas atualizações</Text>

        {/* Barra de Busca e Botão Adicionar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles"
              placeholderTextColor="#9ca3af"
              value={searchValue}
              onChangeText={setSearchValue}
            />
            <Feather name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          </View>

          {isProfessor && (
            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
              <Feather name="plus" size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Posts */}
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No posts found.</Text>
            }
          />
        )}
      </View>
      </SafeAreaView>

      {/* Modal de Adicionar/Editar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Editar Post" : "Novo Post"}</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Título" 
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput 
              style={styles.input} 
              placeholder="Assunto (Tag)" 
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
            />
            
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Conteúdo" 
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
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
    borderColor: 'transparent', // Mantendo estilo do web
  },
  listContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 20,
  },
  postContainer: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 10,
    fontStyle: 'italic'
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  postContent: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 16,
    textAlign: 'center',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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