import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const DAILY_TIPS = [
  {
    id: '1',
    title: 'Hydratation',
    text: 'Boire 2L d\'eau par jour aide à maintenir une fréquence cardiaque stable.',
    icon: 'water-outline',
    color: '#00D1FF'
  },
  {
    id: '2',
    title: 'Sommeil',
    text: 'Un sommeil régulier améliore la récupération cardiaque nocturne.',
    icon: 'moon-outline',
    color: '#8A2BE2'
  },
  {
    id: '3',
    title: 'Activité',
    text: '30 min de marche active renforce votre muscle cardiaque.',
    icon: 'walk-outline',
    color: '#FF6B6B'
  },
  {
    id: '4',
    title: 'Respiration',
    text: 'Prenez 5 min pour respirer profondément et réduire votre BPM.',
    icon: 'leaf-outline',
    color: '#4ECDC4'
  }
];

export default function HealthInsights() {
  return (
    <View style={styles.container}>
      {/* Daily Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conseils du jour</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tipsScroll}
        >
          {DAILY_TIPS.map(tip => (
            <BlurView key={tip.id} intensity={30} tint="light" style={styles.tipCard}>
              <View style={[styles.iconCircle, { backgroundColor: tip.color + '22' }]}>
                <Ionicons name={tip.icon as any} size={24} color={tip.color} />
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </BlurView>
          ))}
        </ScrollView>
      </View>

      {/* Data Understanding Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comprendre mes données</Text>
        <View style={styles.guideContainer}>
          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideLeft}>
              <MaterialCommunityIcons name="heart-pulse" size={28} color="#FD4755" />
              <View style={styles.guideText}>
                <Text style={styles.guideTitle}>Fréquence Cardiaque (BPM)</Text>
                <Text style={styles.guideDesc}>Repos : 60-100 BPM est considéré comme normal.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideLeft}>
              <MaterialCommunityIcons name="molecule" size={28} color="#58a3f8" />
              <View style={styles.guideText}>
                <Text style={styles.guideTitle}>Oxygène (SpO2)</Text>
                <Text style={styles.guideDesc}>Sain : 95% - 100%. Une valeur {'<'} 92% nécessite attention.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideLeft}>
              <MaterialCommunityIcons name="broadcast" size={28} color="#00FF88" />
              <View style={styles.guideText}>
                <Text style={styles.guideTitle}>Signal Infrarouge (IR AC)</Text>
                <Text style={styles.guideDesc}>Reflet du flux sanguin pulsatile. Utilisé pour détecter le pouls.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideLeft}>
              <MaterialCommunityIcons name="sine-wave" size={28} color="#FF4444" />
              <View style={styles.guideText}>
                <Text style={styles.guideTitle}>Signal Rouge (RED AC)</Text>
                <Text style={styles.guideDesc}>Utilisé avec l'IR pour calculer le taux d'oxygène (SpO2).</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'LeagueSpartan_Bold',
    color: '#00386A',
    marginBottom: 15,
  },
  tipsScroll: {
    paddingRight: 20,
  },
  tipCard: {
    width: width * 0.6,
    padding: 15,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'LeagueSpartan_Regular',
    color: '#666',
    lineHeight: 18,
  },
  guideContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  guideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  guideText: {
    marginLeft: 15,
    flex: 1,
  },
  guideTitle: {
    fontSize: 15,
    fontFamily: 'LeagueSpartan_Bold',
    color: '#333',
  },
  guideDesc: {
    fontSize: 12,
    fontFamily: 'LeagueSpartan_Regular',
    color: '#777',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  }
});
