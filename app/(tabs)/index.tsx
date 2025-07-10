import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Cloud, Thermometer, Droplets, Wind, Eye, ChartBar as BarChart3, Sun, CloudRain } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WeatherScreen() {
  return (
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
        {/* Main Weather Information */}
        <View style={styles.mainWeatherSection}>
          <Text style={styles.cityName}>Gölcük</Text>
          <Text style={styles.currentTemp}>25°</Text>
          <Text style={styles.weatherCondition}>Parçalı Bulutlu</Text>
          <Text style={styles.highLowTemp}>Y:28° D:19°</Text>
        </View>

        {/* Hourly Forecast Card */}
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
                { time: 'Şimdi', temp: '25°', icon: <Cloud size={24} color="#ffffff" /> },
                { time: '14:00', temp: '26°', icon: <Sun size={24} color="#ffffff" /> },
                { time: '15:00', temp: '27°', icon: <Sun size={24} color="#ffffff" /> },
                { time: '16:00', temp: '28°', icon: <Sun size={24} color="#ffffff" /> },
                { time: '17:00', temp: '27°', icon: <Cloud size={24} color="#ffffff" /> },
                { time: '18:00', temp: '26°', icon: <Cloud size={24} color="#ffffff" /> },
                { time: '19:00', temp: '24°', icon: <CloudRain size={24} color="#ffffff" /> },
                { time: '20:00', temp: '22°', icon: <CloudRain size={24} color="#ffffff" /> },
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

        {/* 10-Day Forecast Card */}
        <View style={styles.cardContainer}>
          <BlurView intensity={80} style={styles.blurCard}>
            <Text style={styles.cardTitle}>10 GÜNLÜK TAHMİN</Text>
            <View style={styles.dailyForecastContainer}>
              {[
                { day: 'Bugün', icon: <Cloud size={20} color="#ffffff" />, low: '19°', high: '28°', lowPos: 20, highPos: 80 },
                { day: 'Cuma', icon: <Sun size={20} color="#ffffff" />, low: '21°', high: '30°', lowPos: 30, highPos: 85 },
                { day: 'Cmt', icon: <CloudRain size={20} color="#ffffff" />, low: '18°', high: '26°', lowPos: 15, highPos: 75 },
                { day: 'Paz', icon: <CloudRain size={20} color="#ffffff" />, low: '17°', high: '24°', lowPos: 10, highPos: 70 },
                { day: 'Pts', icon: <Sun size={20} color="#ffffff" />, low: '20°', high: '29°', lowPos: 25, highPos: 82 },
                { day: 'Sal', icon: <Cloud size={20} color="#ffffff" />, low: '22°', high: '31°', lowPos: 35, highPos: 88 },
                { day: 'Çar', icon: <Sun size={20} color="#ffffff" />, low: '23°', high: '32°', lowPos: 40, highPos: 90 },
                { day: 'Per', icon: <CloudRain size={20} color="#ffffff" />, low: '19°', high: '27°', lowPos: 20, highPos: 77 },
                { day: 'Cum', icon: <Cloud size={20} color="#ffffff" />, low: '21°', high: '29°', lowPos: 30, highPos: 82 },
                { day: 'Cmt', icon: <Sun size={20} color="#ffffff" />, low: '24°', high: '33°', lowPos: 45, highPos: 92 },
              ].map((item, index) => (
                <View key={index} style={styles.dailyItem}>
                  <View style={styles.dailyLeft}>
                    <Text style={styles.dayText}>{item.day}</Text>
                    <View style={styles.dailyIcon}>
                      {item.icon}
                    </View>
                  </View>
                  <View style={styles.dailyRight}>
                    <Text style={styles.dailyLowTemp}>{item.low}</Text>
                    <View style={styles.tempRangeContainer}>
                      <View style={styles.tempRangeBackground}>
                        <View 
                          style={[
                            styles.tempRangeBar,
                            {
                              left: `${item.lowPos}%`,
                              right: `${100 - item.highPos}%`,
                            }
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.dailyHighTemp}>{item.high}</Text>
                  </View>
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Detail Cards Grid */}
        <View style={styles.detailCardsGrid}>
          {[
            { title: 'HİSSEDİLEN', value: '26°', icon: <Thermometer size={20} color="rgba(255, 255, 255, 0.8)" /> },
            { title: 'NEM', value: '55%', icon: <Droplets size={20} color="rgba(255, 255, 255, 0.8)" /> },
            { title: 'RÜZGAR', value: 'KB 15 km/s', icon: <Wind size={20} color="rgba(255, 255, 255, 0.8)" /> },
            { title: 'GÖRÜŞ MESAFESİ', value: '10 km', icon: <Eye size={20} color="rgba(255, 255, 255, 0.8)" /> },
            { title: 'BASINÇ', value: '1015 hPa', icon: <BarChart3 size={20} color="rgba(255, 255, 255, 0.8)" /> },
            { title: 'UV İNDEKSİ', value: 'Yüksek', icon: <Sun size={20} color="rgba(255, 255, 255, 0.8)" /> },
          ].map((item, index) => (
            <View key={index} style={styles.detailCardContainer}>
              <BlurView intensity={80} style={styles.detailCard}>
                <View style={styles.detailCardIcon}>
                  {item.icon}
                </View>
                <Text style={styles.detailCardTitle}>{item.title}</Text>
                <Text style={styles.detailCardValue}>{item.value}</Text>
              </BlurView>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
  mainWeatherSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  cityName: {
    fontSize: 34,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 8,
  },
  currentTemp: {
    fontSize: 96,
    fontWeight: '200',
    color: '#ffffff',
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 20,
    fontWeight: '400',
    color: '#ffffff',
    marginBottom: 8,
  },
  highLowTemp: {
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
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    letterSpacing: 0.5,
  },
  hourlyScrollView: {
    paddingHorizontal: 20,
  },
  hourlyScrollContent: {
    paddingBottom: 20,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 44,
  },
  hourlyTime: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  hourlyIcon: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  dailyForecastContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dailyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#ffffff',
    width: 50,
  },
  dailyIcon: {
    marginLeft: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  dailyLowTemp: {
    fontSize: 17,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    width: 35,
    textAlign: 'right',
  },
  tempRangeContainer: {
    width: 80,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  tempRangeBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  tempRangeBar: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    top: 0,
  },
  dailyHighTemp: {
    fontSize: 17,
    fontWeight: '400',
    color: '#ffffff',
    width: 35,
    textAlign: 'right',
  },
  detailCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  detailCardContainer: {
    width: (width - 52) / 2,
  },
  detailCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 120,
  },
  detailCardIcon: {
    marginBottom: 8,
  },
  detailCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailCardValue: {
    fontSize: 24,
    fontWeight: '400',
    color: '#ffffff',
    flex: 1,
  },
});