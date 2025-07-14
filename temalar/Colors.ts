// Koyu tema için ana renk
const tintColorDark = '#FFFFFF';
// Açık tema için ana renk (canlı bir mavi)
const tintColorLight = '#007AFF';

export default {
  light: {
    text: '#052C4B', // Koyu Lacivert (Ana Metin)
    background: '#EBF8FF', // Çok Açık, neredeyse beyaz bir gök mavisi (Arka Plan)
    tint: tintColorLight, // Canlı, Parlak Mavi (Aktif Öğeler ve Vurgular)
    icon: '#5A83A5', // Desatüre, sakin bir mavi (Pasif İkonlar ve ikincil metinler)
    tabIconDefault: '#5A83A5',
    tabIconSelected: tintColorLight,
    
    // Kartlar beyaz kalarak mavi arka plandan şık bir şekilde ayrışacak
    cardBackground: 'rgba(255, 255, 255, 0.7)', 
    borderColor: 'rgba(0, 122, 255, 0.15)', // Çok hafif mavi tonlu kenarlık
  },
  dark: {
    text: '#FFFFFF',
    background: '#1E1E1E',
    tint: tintColorDark,
    icon: 'rgba(255, 255, 255, 0.6)',
    tabIconDefault: 'rgba(255, 255, 255, 0.6)',
    tabIconSelected: tintColorDark,
    
    cardBackground: 'rgba(50, 50, 50, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
};