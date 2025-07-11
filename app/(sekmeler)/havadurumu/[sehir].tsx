import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Cloud, Thermometer, Droplets, Wind, Eye, ChartBar as BarChart3, Sun, CloudRain } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

export default function SehirHavaDurumuEkrani() {
  const { sehir, sicaklik } = useLocalSearchParams<{ sehir: string; sicaklik: string }>();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: sehir || 'Hava Durumu',
          headerShown: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { color: '#ffffff' },
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: '#ffffff', fontSize: 16 }}>← Geri</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e3c72', '#2a5298', '#4c6ef5']}
          style={styles.backgroundGradient}
        />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Ana Hava Bilgileri */}
          <View style={styles.anaHavaBolumu}>
            <Text style={styles.sehirAdi}>{sehir}</Text>
            <Text style={styles.anlikSicaklik}>{sicaklik}°</Text>
            <Text style={styles.havaDurumu}>Parçalı Bulutlu</Text>
            <Text style={styles.yuksekDusukSicaklik}>H:{parseInt(sicaklik || '20') + 3}° L:{parseInt(sicaklik || '20') - 6}°</Text>
          </View>

          {/* Saatlik Tahmin Kartı */}
          <View style={styles.cardContainer}>
            <BlurView intensity={80} style={styles.blurCard}>
              <Text style={styles.cardTitle}>SAATLİK HAVA DURUMU</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.hourlyScrollView}
                contentContainerStyle={styles.hourlyScrollContent}
              >
                {[
                  { time: 'Şimdi', temp: `${sicaklik}°`, icon: <Cloud size={24} color="#ffffff" /> },
                  { time: '14:00', temp: `${parseInt(sicaklik || '20') + 1}°`, icon: <Sun size={24} color="#ffffff" /> },
                  { time: '15:00', temp: `${parseInt(sicaklik || '20') + 2}°`, icon: <Sun size={24} color="#ffffff" /> },
                  { time: '16:00', temp: `${parseInt(sicaklik || '20') + 3}°`, icon: <Sun size={24} color="#ffffff" /> },
                  { time: '17:00', temp: `${parseInt(sicaklik || '20') + 2}°`, icon: <Cloud size={24} color="#ffffff" /> },
                  { time: '18:00', temp: `${parseInt(sicaklik || '20') + 1}°`, icon: <Cloud size={24} color="#ffffff" /> },
                  { time: '19:00', temp: `${parseInt(sicaklik || '20') - 1}°`, icon: <CloudRain size={24} color="#ffffff" /> },
                  { time: '20:00', temp: `${parseInt(sicaklik || '20') - 3}°`, icon: <CloudRain size={24} color="#ffffff" /> },
                ].map((item, index) => (
                  <View key={index} style={styles.hourlyItem}>
                    <Text style={styles.hourlyTime}>{item.time}</Text>
                    <View style={styles.hourlyIcon}>
                      {item.icon}
                    </View>
                    <Text style={styles.hourlyTemp}>{item.temp}</Text>
                  </View>
                ))}
              </ScrollView>
            </BlurView>
          </View>

          {/* 10 Günlük Tahmin Kartı */}
          <View style={styles.cardContainer}>
            <BlurView intensity={80} style={styles.blurCard}>
              <Text style={styles.cardTitle}>10 GÜNLÜK TAHMİN</Text>
              <View style={styles.gunlukTahminKapsayici}>
                {[
                  { day: 'Bugün', icon: <Cloud size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 6}°`, high: `${parseInt(sicaklik || '20') + 3}°`, lowPos: 20, highPos: 80 },
                  { day: 'Cuma', icon: <Sun size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 4}°`, high: `${parseInt(sicaklik || '20') + 5}°`, lowPos: 30, highPos: 85 },
                  { day: 'Cmt', icon: <CloudRain size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 7}°`, high: `${parseInt(sicaklik || '20') + 1}°`, lowPos: 15, highPos: 75 },
                  { day: 'Paz', icon: <CloudRain size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 8}°`, high: `${parseInt(sicaklik || '20') - 1}°`, lowPos: 10, highPos: 70 },
                  { day: 'Pts', icon: <Sun size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 5}°`, high: `${parseInt(sicaklik || '20') + 4}°`, lowPos: 25, highPos: 82 },
                  { day: 'Sal', icon: <Cloud size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 3}°`, high: `${parseInt(sicaklik || '20') + 6}°`, lowPos: 35, highPos: 88 },
                  { day: 'Çar', icon: <Sun size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 2}°`, high: `${parseInt(sicaklik || '20') + 7}°`, lowPos: 40, highPos: 90 },
                  { day: 'Per', icon: <CloudRain size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 6}°`, high: `${parseInt(sicaklik || '20') + 2}°`, lowPos: 20, highPos: 77 },
                  { day: 'Cum', icon: <Cloud size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 4}°`, high: `${parseInt(sicaklik || '20') + 4}°`, lowPos: 30, highPos: 82 },
                  { day: 'Cmt', icon: <Sun size={20} color="#ffffff" />, low: `${parseInt(sicaklik || '20') - 1}°`, high: `${parseInt(sicaklik || '20') + 8}°`, lowPos: 45, highPos: 92 },
                ].map((item, index) => (
                  <View key={index} style={styles.gunlukItem}>
                    <View style={styles.gunlukSol}>
                      <Text style={styles.gunText}>{item.day}</Text>
                      <View style={styles.gunlukIcon}>
                        {item.icon}
                      </View>
                    </View>
                    <View style={styles.gunlukSag}>
                      <Text style={styles.gunlukDusukSicaklik}>{item.low}</Text>
                      <View style={styles.sicaklikAralikKapsayici}>
                        <View style={styles.sicaklikAralikArkaPlan}>
                          <View 
                            style={[
                              styles.sicaklikAralikBar,
                              {
                                left: `${item.lowPos}%`,
                                right: `${100 - item.highPos}%`,
                              }
                            ]}
                          />
                        </View>
                      </View>
                      <Text style={styles.gunlukYuksekSicaklik}>{item.high}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>

          {/* Detay Kartları Grid */}
          <View style={styles.detayKartlarGrid}>
            {[
              { title: 'HİSSEDİLEN', value: `${parseInt(sicaklik || '20') + 1}°`, icon: <Thermometer size={20} color="rgba(255, 255, 255, 0.8)" /> },
              { title: 'NEM', value: '55%', icon: <Droplets size={20} color="rgba(255, 255, 255, 0.8)" /> },
              { title: 'RÜZGAR', value: 'KB 15 km/s', icon: <Wind size={20} color="rgba(255, 255, 255, 0.8)" /> },
              { title: 'GÖRÜŞ MESAFESİ', value: '10 km', icon: <Eye size={20} color="rgba(255, 255, 255, 0.8)" /> },
              { title: 'BASINÇ', value: '1015 hPa', icon: <BarChart3 size={20} color="rgba(255, 255, 255, 0.8)" /> },
              { title: 'UV İNDEKSİ', value: 'Yüksek', icon: <Sun size={20} color="rgba(255, 255, 255, 0.8)" /> },
            ].map((item, index) => (
              <View key={index} style={styles.detayKartKapsayici}>
                <BlurView intensity={80} style={styles.detayKart}>
                  <View style={styles.detayKartIcon}>
                    {item.icon}
                  </View>
                  <Text style={styles.detayKartBaslik}>{item.title}</Text>
                  <Text style={styles.detayKartDeger}>{item.value}</Text>
                </BlurView>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c72',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  anaHavaBolumu: {
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sehirAdi: {
    fontSize: 34,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 8,
  },
  anlikSicaklik: {
    fontSize: 96,
    fontWeight: '200',
    color: '#ffffff',
    marginBottom: 4,
  },
  havaDurumu: {
    fontSize: 20,
    fontWeight: '400',
    color: '#ffffff',
    marginBottom: 8,
  },
  yuksekDusukSicaklik: {
    fontSize: 20,
    fontWeight: '400',
    color: '#ffffff',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  blurCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  hourlyScrollView: {
    flexGrow: 0,
  },
  hourlyScrollContent: {
    paddingHorizontal: 4,
  },
  hourlyItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    minWidth: 60,
  },
  hourlyTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  hourlyIcon: {
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  gunlukTahminKapsayici: {
    gap: 12,
  },
  gunlukItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gunlukSol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gunText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    width: 50,
  },
  gunlukIcon: {
    marginLeft: 12,
  },
  gunlukSag: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  gunlukDusukSicaklik: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    width: 40,
    textAlign: 'right',
  },
  sicaklikAralikKapsayici: {
    flex: 1,
    marginHorizontal: 12,
    height: 6,
    justifyContent: 'center',
  },
  sicaklikAralikArkaPlan: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    position: 'relative',
  },
  sicaklikAralikBar: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  gunlukYuksekSicaklik: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    width: 40,
    textAlign: 'left',
  },
  detayKartlarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 12,
  },
  detayKartKapsayici: {
    width: (width - 52) / 2,
  },
  detayKart: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    alignItems: 'center',
  },
  detayKartIcon: {
    marginBottom: 8,
  },
  detayKartBaslik: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textAlign: 'center',
  },
  detayKartDeger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
}); 