const tintColorDark = '#FFFFFF';
const tintColorLight = '#007AFF';

export default {
  light: {
    text: '#052C4B',
    background: '#F0F2F5', // Hafif kırık beyaz arkaplan
    tint: tintColorLight,
    icon: '#6B8A9E',
    tabIconDefault: '#6B8A9E',
    tabIconSelected: tintColorLight,
    
    // DEĞİŞİKLİK: Kart arka planı artık opak beyaz
    cardBackground: '#FFFFFF', 
    borderColor: '#E5E5EA',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1E1E1E',
    tint: tintColorDark,
    icon: 'rgba(255, 255, 255, 0.6)',
    tabIconDefault: 'rgba(255, 255, 255, 0.6)',
    tabIconSelected: tintColorDark,
    
    // DEĞİŞİKLİK: Kart arka planı artık opak ve standart bir koyu gri
    cardBackground: '#2C2C2E',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
};