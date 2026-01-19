import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatBubble from '../composants/ChatBubble';
import ChatInput from '../composants/ChatInput';
import useSocket from '../hooks/useSocket';

interface Message {
  id: number | string;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const { contactId, contactName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { lastMessage, sendMessage: socketSendMessage } = useSocket();

  useEffect(() => {
    loadUserIdAndHistory();
  }, [contactId]);

  useEffect(() => {
    if (lastMessage && lastMessage.senderId === parseInt(contactId as string)) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: lastMessage.senderId,
        receiver_id: userId!,
        content: lastMessage.content,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
    }
  }, [lastMessage]);

  const loadUserIdAndHistory = async () => {
    const storedId = await AsyncStorage.getItem('userId');
    if (storedId) {
      const id = parseInt(storedId);
      setUserId(id);
      fetchHistory(id);
    }
  };

  const fetchHistory = async (myId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/history/${myId}/${contactId}`);
      const data = await response.json();
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Erreur fetch history:', error);
    }
  };

  const [messageText, setMessageText] = useState('');

  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId) return;
    const text = messageText;
    setMessageText('');

    const newMessage: Message = {
      id: 'temp-' + Date.now(),
      sender_id: userId,
      receiver_id: parseInt(contactId as string),
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      // 1. Send via API to persist
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: userId,
          receiver_id: parseInt(contactId as string),
          content: text
        })
      });

      if (response.ok) {
        // 2. Send via Socket for real-time delivery
        socketSendMessage(parseInt(contactId as string), text);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#00386A' }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00386A" />
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerProfile}>
            <Image 
              source={require("../../assets/images/photoProfil.jpg")} 
              style={styles.largeAvatar}
            />
            <Text style={styles.doctorName}>{contactName}</Text>
          </View>

          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.miniActionButton}>
              <Ionicons name="call-outline" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniActionButton}>
              <Ionicons name="videocam-outline" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniActionButton}>
              <Ionicons name="document-text-outline" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniActionButton}>
              <Ionicons name="information-circle-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          style={styles.chatList}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <ChatBubble
              message={item.content}
              isUser={item.sender_id === userId}
              timestamp={new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ChatInput 
            value={messageText} 
            onChangeText={setMessageText} 
            onSend={handleSendMessage} 
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#00386A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 180,
  },
  backButton: { padding: 5 },
  headerProfile: {
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  largeAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#EEE',
  },
  doctorName: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'LeagueSpartan_Bold',
    marginTop: 10,
  },
  actionIcons: {
    flexDirection: 'column',
    gap: 8,
  },
  miniActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0055FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  miniAvatarText: { color: '#FFF', fontSize: 16, fontFamily: 'LeagueSpartan_Bold' },
  headerTitle: { fontSize: 18, fontFamily: 'LeagueSpartan_Bold' },
  headerIcon: { padding: 5 },
  chatList: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 20 },
});
