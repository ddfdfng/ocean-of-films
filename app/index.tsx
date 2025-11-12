import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchLatestPlTVShows,
  fetchLatestUkrTVShows,
  fetchPopularMovies,
  fetchTopRatedMovies,
} from '../api/tmdb';

const { width } = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const options = {
  headerShown: false,
};

type TabType = 'home' | 'favMovies' | 'favTV';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [popularUkrTV, setPopularUkrTV] = useState<any[]>([]);
  const [latestPlTV, setLatestPlTV] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesMovies, setFavoritesMovies] = useState<any[]>([]);
  const [favoritesTV, setFavoritesTV] = useState<any[]>([]);
  const router = useRouter();

  // 🔹 Анімації для кожної іконки окремо
  const scaleHome = useRef(new Animated.Value(1)).current;
  const scaleFav = useRef(new Animated.Value(1)).current;
  const scaleSettings = useRef(new Animated.Value(1)).current;

  // 🔹 При зміні активної вкладки — лише вона анімується
  useEffect(() => {
    let anim;
    switch (activeTab) {
      case 'home':
        anim = scaleHome;
        break;
      case 'favMovies':
        anim = scaleFav;
        break;
      case 'favTV':
        anim = scaleSettings;
        break;
      default:
        return;
    }

    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.25,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  // 🔹 Завантаження даних
  useEffect(() => {
    const loadAll = async () => {
      const [popMovies, topMovies, ukrTV, plTV] = await Promise.all([
        fetchPopularMovies(),
        fetchTopRatedMovies(),
        fetchLatestUkrTVShows(),
        fetchLatestPlTVShows(),
      ]);

      const sortByDate = (arr: any[], isTV = false) =>
        [...arr].sort((a, b) => {
          const dateA = new Date(isTV ? a.first_air_date : a.release_date).getTime();
          const dateB = new Date(isTV ? b.first_air_date : b.release_date).getTime();
          return dateB - dateA;
        });

      setPopularMovies(sortByDate(popMovies));
      setTopRatedMovies(sortByDate(topMovies));
      setPopularUkrTV(sortByDate(ukrTV, true));
      setLatestPlTV(sortByDate(plTV, true));

      await loadFavorites();
      setLoading(false);
    };
    loadAll();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedMovies = await AsyncStorage.getItem('favoritesMovies');
      const storedTV = await AsyncStorage.getItem('favoritesTV');
      if (storedMovies) setFavoritesMovies(JSON.parse(storedMovies));
      if (storedTV) setFavoritesTV(JSON.parse(storedTV));
    } catch (e) {
      console.error('Error loading favorites', e);
    }
  };

  const saveFavorites = async (movies: any[], tv: any[]) => {
    try {
      await AsyncStorage.setItem('favoritesMovies', JSON.stringify(movies));
      await AsyncStorage.setItem('favoritesTV', JSON.stringify(tv));
    } catch (e) {
      console.error('Error saving favorites', e);
    }
  };

  const toggleFavorite = (item: any, isTV = false) => {
    if (isTV) {
      const updated = favoritesTV.some(fav => fav.id === item.id)
        ? favoritesTV.filter(fav => fav.id !== item.id)
        : [...favoritesTV, item];
      setFavoritesTV(updated);
      saveFavorites(favoritesMovies, updated);
    } else {
      const updated = favoritesMovies.some(fav => fav.id === item.id)
        ? favoritesMovies.filter(fav => fav.id !== item.id)
        : [...favoritesMovies, item];
      setFavoritesMovies(updated);
      saveFavorites(updated, favoritesTV);
    }
  };

  const isFavorite = (item: any, isTV = false) =>
    isTV ? favoritesTV.some(fav => fav.id === item.id) : favoritesMovies.some(fav => fav.id === item.id);

  const renderCard = (item: any, isTV = false) => (
    <TouchableOpacity
      key={item.id.toString()}
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: '/details',
          params: { id: item.id.toString(), type: isTV ? 'tv' : 'movie' },
        });
      }}
    >
      <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.poster} />
      <TouchableOpacity
        style={styles.favoriteIcon}
        onPress={() => toggleFavorite(item, isTV)}
      >
        <Ionicons
          name={isFavorite(item, isTV) ? 'star' : 'star-outline'}
          size={28}
          color={isFavorite(item, isTV) ? '#FFD700' : '#fff'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAdCard = (index: number) => (
    <View key={index} style={styles.adCard}>
      <Text style={styles.adText}>Тут може бути ваша реклама</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Верхній заголовок */}
        <View style={styles.customHeader}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={{ borderRadius: 50, width: 50, height: 50, resizeMode: 'contain' }}
          />
          <View style={{ width: 10 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={styles.glowButton}
              onPress={() => router.push('/search')}
            >
              <Ionicons name="search" size={18} color="#000" />
              <Text style={styles.glowButtonText}>Пошук</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.glowButton}
              onPress={() => router.push('/filters')}
            >
              <Ionicons name="filter" size={18} color="#000" />
              <Text style={styles.glowButtonText}>Обрати</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Контент сторінки */}
        <View style={styles.content}>
          {activeTab === 'home' && (
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
              <Text style={styles.heading}>🔥 Популярні фільми</Text>
              <FlatList
                data={popularMovies.filter(movie => movie.poster_path)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                snapToInterval={width * 0.65}
                decelerationRate="fast"
                renderItem={({ item }) => renderCard(item)}
              />

              <Text style={styles.heading}>⭐ Високо оцінені</Text>
              <FlatList
                data={topRatedMovies.filter(movie => movie.poster_path)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                snapToInterval={width * 0.65}
                decelerationRate="fast"
                renderItem={({ item }) => renderCard(item)}
              />

              <Text style={styles.heading}>📺 Українські серіали</Text>
              <FlatList
                data={popularUkrTV.filter(tv => tv.poster_path)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                snapToInterval={width * 0.65}
                decelerationRate="fast"
                renderItem={({ item }) => renderCard(item, true)}
              />

              <Text style={styles.heading}>📺 Польські серіали</Text>
              <FlatList
                data={latestPlTV.filter(tv => tv.poster_path)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                snapToInterval={width * 0.65}
                decelerationRate="fast"
                renderItem={({ item }) => renderCard(item, true)}
              />

              <Text style={styles.heading}>📢 Реклама</Text>
              <FlatList
                data={[0, 1, 2]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toString()}
                contentContainerStyle={styles.list}
                snapToInterval={width * 0.8}
                decelerationRate="fast"
                renderItem={({ item }) => renderAdCard(item)}
              />
            </ScrollView>
          )}

          {activeTab === 'favMovies' && (
            <FlatList
              data={favoritesMovies.filter(movie => movie.poster_path)}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.scrollContent}
              renderItem={({ item }) => renderCard(item)}
              ListEmptyComponent={<Text style={styles.emptyText}>У вас немає обраних фільмів</Text>}
            />
          )}

          {activeTab === 'favTV' && (
            <FlatList
              data={favoritesTV.filter(tv => tv.poster_path)}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.scrollContent}
              renderItem={({ item }) => renderCard(item, true)}
              ListEmptyComponent={<Text style={styles.emptyText}>У вас немає обраних серіалів</Text>}
            />
          )}
        </View>

        {/* Нижній таб-бар */}
        <View style={styles.tabBar}>
          <Animated.View style={{ transform: [{ scale: scaleFav }] }}>
            <TouchableOpacity onPress={() => setActiveTab('favMovies')}>
              <Ionicons
                name="heart"
                size={30}
                color={activeTab === 'favMovies' ? '#fff' : 'rgba(255,255,255,0.4)'}
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleHome }] }}>
            <TouchableOpacity onPress={() => setActiveTab('home')}>
              <Ionicons
                name="home"
                size={34}
                color={activeTab === 'home' ? '#fff' : 'rgba(255,255,255,0.4)'}
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleSettings }] }}>
            <TouchableOpacity onPress={() => setActiveTab('favTV')}>
              <Ionicons
                name="settings"
                size={30}
                color={activeTab === 'favTV' ? '#fff' : 'rgba(255,255,255,0.4)'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#030f26' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  container: { flex: 1, backgroundColor: '#030f26' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  customHeader: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glowButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    alignItems: 'center',
    gap: 6,
  },
  glowButtonText: { color: '#030f26', fontWeight: '600', fontSize: 14 },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  list: { paddingLeft: 15, paddingBottom: 30 },
  card: {
    width: width * 0.6,
    height: width,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1c1c1c',
    elevation: 5,
  },
  poster: { width: '100%', height: width },
  favoriteIcon: { position: 'absolute', bottom: 8, right: 8 },
  adCard: {
    width: width * 0.8,
    height: width * 0.5,
    marginRight: 15,
    borderRadius: 15,
    backgroundColor: '#3b3b3b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tabBar: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 15, 38, 0.97)',
    borderRadius: 22,
    paddingHorizontal: 20,
    width: '70%',
    height: 60,
    alignSelf: 'center',
    elevation: 5,
  },
  scrollContent: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
  },
});
