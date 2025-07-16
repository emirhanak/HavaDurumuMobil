import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Check, CloudRain, Thermometer, Wind } from 'lucide-react-native';
import { haritaKatmanlari, KatmanKey, KatmanIkonAdi } from './HavaDurumuHaritasi';

const ikonlar: Record<KatmanIkonAdi, React.ElementType> = {
    CloudRain,
    Thermometer,
    Wind,
};

interface LayerMenuProps {
    aktifKatman: KatmanKey | null;
    onKatmanSec: (katman: KatmanKey | null) => void;
    onClose: () => void;
    visible: boolean;
}

export default function LayerMenu({ aktifKatman, onKatmanSec, onClose, visible }: LayerMenuProps) {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.menuContainer}>
          <BlurView intensity={80} tint="dark" style={styles.blurView}>
            {haritaKatmanlari.map((katman, index) => {
              const IconComponent = ikonlar[katman.iconName];
              return (
                <TouchableOpacity 
                  key={katman.key} 
                  style={[
                    styles.menuItem,
                    index === haritaKatmanlari.length - 1 && { borderBottomWidth: 0 }
                  ]} 
                  onPress={() => onKatmanSec(katman.key)}
                >
                  <View style={styles.menuItemLeft}>
                    {IconComponent && <IconComponent size={20} color={'#FFFFFF'} />}
                    <Text style={styles.menuText}>{katman.title}</Text>
                  </View>
                  {aktifKatman === katman.key && <Check size={20} color="white" />}
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalBackdrop: { 
        flex: 1, 
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 110,
        paddingRight: 15,
    },
    menuContainer: { 
        width: 240, 
        borderRadius: 14, 
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    blurView: {
        width: '100%'
    },
    menuItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 15, 
        borderBottomWidth: 0.5, 
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    menuItemLeft: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 15 
    },
    menuText: { 
        color: 'white', 
        fontSize: 16,
        fontWeight: '500'
    },
});