import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '../../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const connect = async () => {
    const storedId = await AsyncStorage.getItem('userId');
    const uId = storedId ? parseInt(storedId) : null;
    setUserId(uId);
    
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('✅ WebSocket connecté');
      setIsConnected(true);
      
      // S'identifier auprès du serveur
      if (uId) {
        ws.current?.send(JSON.stringify({
          type: 'IDENTIFY',
          userId: uId
        }));
      }
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        switch (data.type) {
          case 'SENSOR_DATA':
            setSensorData(data);
            break;
          case 'NEW_MESSAGE':
            setLastMessage(data);
            break;
          case 'NOTIFICATION':
            setNotifications(prev => [data, ...prev]);
            break;
          default:
            console.log('Message WS inconnu:', data);
        }
      } catch (err) {
        console.error('Erreur parsing message WS:', err);
      }
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket déconnecté. Tentative de reconnexion...');
      setIsConnected(false);
      setTimeout(connect, 3000);
    };

    ws.current.onerror = (e) => {
      console.error('Erreur WebSocket:', e);
    };
  };

  const sendMessage = (receiverId: number, content: string) => {
    if (ws.current && isConnected && userId) {
      ws.current.send(JSON.stringify({
        type: 'CHAT_MESSAGE',
        senderId: userId,
        receiverId,
        content
      }));
    }
  };

  return { isConnected, lastMessage, sensorData, notifications, sendMessage };
};
