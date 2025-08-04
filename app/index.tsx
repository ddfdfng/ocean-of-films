import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  fetcchPopularMovies,
  fetchPopularUkrTVShows,
  fetchTopRatedMovies,
} from '../api/tmdb';

const { width } = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const options = {
  headerShown: false,
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'favMovies' | 'favTV'>('home');
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [popularUkrTV, setPopularUkrTV] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesMovies, setFavoritesMovies] = useState<any[]>([]);
  const [favoritesTV, setFavoritesTV] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadAll = async () => {
      const [popMovies, topMovies, ukrTV] = await Promise.all([
        fetcchPopularMovies(),
        fetchTopRatedMovies(),
        fetchPopularUkrTVShows(),
      ]);
      setPopularMovies(popMovies);
      setTopRatedMovies(topMovies);
      setPopularUkrTV(ukrTV);
      setLoading(false);
    };
    loadAll();
  }, []);

  const toggleFavorite = (item: any, isTV = false) => {
    if (isTV) {
      if (favoritesTV.some(fav => fav.id === item.id)) {
        setFavoritesTV(favoritesTV.filter(fav => fav.id !== item.id));
      } else {
        setFavoritesTV([...favoritesTV, item]);
      }
    } else {
      if (favoritesMovies.some(fav => fav.id === item.id)) {
        setFavoritesMovies(favoritesMovies.filter(fav => fav.id !== item.id));
      } else {
        setFavoritesMovies([...favoritesMovies, item]);
      }
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Верхній заголовок */}
      <View style={styles.customHeader}>
        <Text style={styles.logoText}>🌊 Ocean of Films</Text>
        <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/filters')}>
          <Ionicons name="search" size={20} color="#000" />
          <Text style={styles.searchButtonText}>Знайти</Text>
        </TouchableOpacity>
      </View>

      {/* Контент в залежності від активної вкладки */}
      <View style={styles.content}>
        {activeTab === 'home' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.heading}>🔥 Популярні фільми</Text>
            <FlatList
              data={popularMovies}
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
              data={topRatedMovies}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
              snapToInterval={width * 0.65}
              decelerationRate="fast"
              renderItem={({ item }) => renderCard(item)}
            />

            <Text style={styles.heading}>📺 Найпопулярніші українські серіали</Text>
            <FlatList
              data={popularUkrTV}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
              snapToInterval={width * 0.65}
              decelerationRate="fast"
              renderItem={({ item }) => renderCard(item, true)}
            />
          </ScrollView>
        )}

        {activeTab === 'favMovies' && (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {favoritesMovies.length === 0 ? (
              <Text style={styles.emptyText}>У вас немає обраних фільмів</Text>
            ) : (
              favoritesMovies.map((item) => renderCard(item))
            )}
          </ScrollView>
        )}

        {activeTab === 'favTV' && (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {favoritesTV.length === 0 ? (
              <Text style={styles.emptyText}>У вас немає обраних серіалів</Text>
            ) : (
              favoritesTV.map((item) => renderCard(item, true))
            )}
          </ScrollView>
        )}
      </View>

      {/* Нижній таб-бар */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name="home"
            size={28}
            color={activeTab === 'home' ? '#fff' : 'rgba(255, 255, 255, 0.5)'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('favMovies')}
        >
          <Ionicons
            name="film"
            size={28}
            color={activeTab === 'favMovies' ? '#fff' : 'rgba(255, 255, 255, 0.5)'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('favTV')}
        >
          <Ionicons
            name="tv"
            size={28}
            color={activeTab === 'favTV' ? '#fff' : 'rgba(255, 255, 255, 0.5)'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },

  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 90,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#000',
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    gap: 5,
  },
  searchButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },

  content: {
    flex: 1,
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },

  list: {
    paddingLeft: 15,
    paddingBottom: 30,
  },
  card: {
    width: width * 0.6,
    height: width,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1c1c1c',
    elevation: 5,
  },
  poster: {
    width: '100%',
    height: width,
  },

  favoriteIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },

  tabBar: {
    height: 60,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabItem: {
    width: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
