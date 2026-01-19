import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Navigation from '../composants/navigation';
import { API_URL } from '../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`${API_URL}/api/notifications/${userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/notifications/read/${id}`, { method: 'PUT' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erreur mark as read:', error);
    }
  };

  const groupNotificationsByDate = (notifs: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    notifs.forEach(n => {
      const date = new Date(n.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key = date.toLocaleDateString();
      if (date.toDateString() === today.toDateString()) key = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
      else key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  };

  const groupedNotifs = groupNotificationsByDate(notifications);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return 'calendar';
      case 'appointment': return 'calendar-outline';
      case 'notes': return 'document-text-outline';
      case 'message': return 'chatbubble-outline';
      default: return 'notifications-outline';
    }
  };

  const renderSection = (title: string, data: Notification[]) => (
    <View key={title} style={styles.sectionContainer}>
      <View style={styles.datePill}>
        <Text style={styles.dateText}>{title}</Text>
      </View>
      {data.map(item => (
        <TouchableOpacity 
          key={item.id}
          style={[styles.notificationItem, !item.is_read && styles.highlightedItem]}
          onPress={() => markAsRead(item.id)}
        >
          <View style={[styles.iconContainer, !item.is_read && styles.highlightedIconContainer]}>
            <Ionicons 
              name={getIcon(item.type) as any} 
              size={24} 
              color={!item.is_read ? "#00386A" : "white"} 
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.notifHeaderRow}>
              <Text style={[styles.notifTitle, !item.is_read && styles.highlightedText]}>{item.title}</Text>
              <Text style={[styles.notifTime, !item.is_read && styles.highlightedText]}>
                {new Date(item.created_at).getHours()} H
              </Text>
            </View>
            <Text style={[styles.notifMessage, !item.is_read && styles.highlightedText]} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#00386A' }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00386A" />
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <TouchableOpacity style={styles.medecinButton}>
            <Text style={styles.medecinText}>Medecin</Text>
            <View style={styles.redDot} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={Object.keys(groupedNotifs)}
          keyExtractor={item => item}
          renderItem={({ item }) => renderSection(item, groupedNotifs[item])}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Aucune notification</Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#00386A',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 24, fontFamily: 'LeagueSpartan_Bold', color: 'white' },
  medecinButton: {
    backgroundColor: '#00264D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  medecinText: { color: 'white', fontSize: 13, fontFamily: 'LeagueSpartan_Medium' },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'red', marginLeft: 5 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  sectionContainer: { marginBottom: 20 },
  datePill: {
    backgroundColor: '#00386A',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  dateText: { color: 'white', fontFamily: 'LeagueSpartan_Bold', fontSize: 16 },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'flex-start',
    marginBottom: 10,
    borderRadius: 12,
  },
  highlightedItem: {
    backgroundColor: '#00386A',
    paddingHorizontal: 15,
    marginHorizontal: -15, // Negative margin to bleed out if desired, or just use padding
    borderRadius: 0,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00386A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  highlightedIconContainer: {
    backgroundColor: 'white',
  },
  textContainer: { flex: 1 },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  notifTitle: { fontSize: 18, fontFamily: 'LeagueSpartan_Bold', color: '#000' },
  notifTime: { fontSize: 12, color: '#666' },
  notifMessage: { fontSize: 14, fontFamily: 'LeagueSpartan_Regular', color: '#666' },
  highlightedText: { color: 'white' },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
    marginLeft: 10,
  },
  emptyContainer: { flex: 1, marginTop: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 15, fontSize: 16, color: '#999', fontFamily: 'LeagueSpartan_Medium' },
});
