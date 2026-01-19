import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Navigation from "../composants/navigation";
import DoctorCard from "../composants/DoctorCard";

// Mock Data for Notifications
const notifications = [
    {
        id: '1',
        type: 'appointment',
        title: 'Scheduled Appointment',
        time: '2 M',
        date: 'Today',
        icon: 'calendar-outline',
        description: '',
        highlight: false
    },
    {
        id: '2',
        type: 'change',
        title: 'Scheduled Change',
        time: '2 H',
        date: 'Today',
        icon: 'calendar-month-outline',
        description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        highlight: true
    },
    {
        id: '3',
        type: 'notes',
        title: 'Medical Notes',
        time: '3 H',
        date: 'Today',
        icon: 'file-document-outline',
        description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        highlight: false
    },
    {
        id: '4',
        type: 'appointment',
        title: 'Scheduled Appointment',
        time: '1 D',
        date: 'Yesterday',
        icon: 'calendar-outline',
        description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        highlight: false
    },
    {
        id: '5',
        type: 'update',
        title: 'Medical History Update',
        time: '5 D',
        date: '15 April',
        icon: 'chatbubble-outline',
        description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        highlight: false
    }
];

// Mock Data for Doctors
const doctors = [
    {
        id: '1',
        name: 'Dr. Alexander Bennett, Ph.D.',
        specialty: 'Dermato-Genetics',
        image: require('../../assets/images/photoProfil.jpg') // Reusing existing image for now
    },
    {
        id: '2',
        name: 'Dr. Michael Davidson, M.D.',
        specialty: 'Solar Dermatology',
        image: require('../../assets/images/photoProfil.jpg')
    },
    {
        id: '3',
        name: 'Dr. Olivia Turner, M.D.',
        specialty: 'Dermato-Endocrinology',
        image: require('../../assets/images/photoProfil.jpg')
    }
];

export default function NotificationScreen() {
  const renderNotification = (item: any) => (
    <View key={item.id} style={[styles.notifItem, item.highlight && styles.notifHighlight]}>
      <View style={[styles.notifIconContainer, item.highlight && styles.iconHighlight]}>
        {item.type === 'change' ? (
             <MaterialCommunityIcons name={item.icon} size={24} color={item.highlight ? "#00386A" : "white"} />
        ) : (
            <Ionicons name={item.icon} size={24} color={item.highlight ? "#00386A" : "white"} />
        )}
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, item.highlight && styles.textHighlight]}>{item.title}</Text>
          <Text style={[styles.notifTime, item.highlight && styles.textHighlight]}>{item.time}</Text>
        </View>
        {item.description ? (
          <Text style={[styles.notifDesc, item.highlight && styles.textHighlight]}>{item.description}</Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Section Today */}
        <View style={styles.datePill}>
            <Text style={styles.dateText}>Today</Text>
        </View>
        {notifications.filter(n => n.date === 'Today').map(renderNotification)}

        {/* Section Yesterday */}
        <View style={styles.datePill}>
            <Text style={styles.dateText}>Yesterday</Text>
        </View>
        {notifications.filter(n => n.date === 'Yesterday').map(renderNotification)}

        {/* Section 15 April */}
        <View style={styles.datePill}>
            <Text style={styles.dateText}>15 April</Text>
        </View>
        {notifications.filter(n => n.date === '15 April').map(renderNotification)}

        <Text style={styles.sectionTitle}>Medecin pouvant vous suivre</Text>
        
        <View style={styles.doctorList}>
            {doctors.map(dr => (
                <DoctorCard 
                    key={dr.id}
                    name={dr.name}
                    specialty={dr.specialty}
                    image={dr.image}
                />
            ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Navigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  datePill: {
      backgroundColor: '#00386A',
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingVertical: 8,
      alignSelf: 'flex-start',
      marginBottom: 15,
      marginTop: 10,
  },
  dateText: {
      color: 'white',
      fontWeight: 'bold',
      fontFamily: 'LeagueSpartan_Bold',
  },
  notifItem: {
      flexDirection: 'row',
      paddingVertical: 15,
      paddingHorizontal: 5,
      marginBottom: 5,
      borderRadius: 15,
  },
  notifHighlight: {
      backgroundColor: '#00386A',
      paddingHorizontal: 15,
      marginHorizontal: -15,
      borderRadius: 0,
  },
  notifIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#00386A',
      justifyContent: 'center',
      alignItems: 'center',
  },
  iconHighlight: {
      backgroundColor: 'white',
  },
  notifContent: {
      flex: 1,
      marginLeft: 15,
  },
  notifHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  notifTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: 'black',
      fontFamily: 'LeagueSpartan_Bold',
  },
  notifTime: {
      fontSize: 12,
      color: '#666',
  },
  notifDesc: {
      fontSize: 13,
      color: '#666',
      marginTop: 5,
      lineHeight: 18,
  },
  textHighlight: {
      color: 'white',
  },
  sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: 'LeagueSpartan_Bold',
  },
  doctorList: {
      width: '100%',
  }
});