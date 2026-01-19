import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Navigation from '../composants/navigation';
import { API_URL } from '../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface Conversation {
  contact_id: number;
  last_message: string;
  created_at: string;
  is_read: boolean;
  sender_id: number;
  nom: string;
  prenom: string;
}

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`${API_URL}/api/messages/conversations/${userId}`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Erreur fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => router.push({
        pathname: "/screens/ChatDetailScreen",
        params: { contactId: item.contact_id, contactName: `${item.prenom} ${item.nom}` }
      })}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.prenom[0]}{item.nom[0]}</Text>
        </View>
        <View style={styles.onlineBadge} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.contactName}>{item.prenom} {item.nom}</Text>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.lastMessage, !item.is_read && item.sender_id !== item.contact_id && styles.unreadText]} numberOfLines={1}>
          {item.last_message}
        </Text>
      </View>
      {!item.is_read && item.sender_id === item.contact_id && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#00386A' }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00386A" />
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.newChatButton}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.contact_id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Aucune discussion pour le moment</Text>
              </View>
            ) : null
          }
        />

        <Navigation />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#00386A',
  },
  headerTitle: { fontSize: 24, fontFamily: 'LeagueSpartan_Bold', color: 'white' },
  newChatButton: { padding: 5 },
  listContent: { paddingBottom: 100 },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FAFAFA',
  },
  avatarContainer: { position: 'relative', marginRight: 15 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0055FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 20, fontFamily: 'LeagueSpartan_Bold' },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FF88',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  textContainer: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  contactName: { fontSize: 18, fontFamily: 'LeagueSpartan_Bold', color: '#333' },
  dateText: { fontSize: 12, color: '#999' },
  lastMessage: { fontSize: 14, color: '#777', fontFamily: 'LeagueSpartan_Regular' },
  unreadText: { color: '#000', fontFamily: 'LeagueSpartan_Bold' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0055FF' },
  emptyContainer: { flex: 1, marginTop: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 15, fontSize: 16, color: '#999', fontFamily: 'LeagueSpartan_Medium' },
});
