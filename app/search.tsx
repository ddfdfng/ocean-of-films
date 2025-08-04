import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_KEY = 'b53e87d6d9e6dd2ea9fd63e73fe99e4c'; // заміни на свій ключ
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type Params = {
  type?: string;  // "Фільми" або "Серіали"
  genre?: string; // жанр українською, напр. "Драма"
};

const GENRE_ID_MAP_MOVIE: Record<string, number> = {
  Драма: 18,
  Комедія: 35,
  Бойовик: 28,
  Фантастика: 878,
};

const GENRE_ID_MAP_TV: Record<string, number> = {
  Драма: 18,
  Комедія: 35,
  Бойовик: 10759,
  Фантастика: 10765,
};

export default function SearchScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const typeApi = params.type === 'Серіали' ? 'tv' : 'movie'; // за замовчуванням фільми
  const genreName = params.genre || '';

  // Визначаємо genre_id для API
  const genreId =
    typeApi === 'movie' ? GENRE_ID_MAP_MOVIE[genreName] : GENRE_ID_MAP_TV[genreName];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Формуємо URL запиту до discover API з фільтрами
        let url = `https://api.themoviedb.org/3/discover/${typeApi}?api_key=${API_KEY}&language=uk-UA&sort_by=popularity.desc`;

        if (genreId) {
          url += `&with_genres=${genreId}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        setResults(data.results || []);
      } catch (error) {
        console.error('Помилка при пошуку:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.type, params.genre]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!results.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Нічого не знайдено за обраними фільтрами.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Повернутися назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => {
          const title = item.title || item.name || 'Без назви';
          const date = item.release_date || item.first_air_date || '—';
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/details', params: { id: item.id.toString() } })}
            >
              <Image source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }} style={styles.poster} />
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.date}>📅 {date}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingTop: 40, paddingHorizontal: 15 },
  backButton: { marginTop: 20 },
  backButtonText: { color: '#fff', fontSize: 18 },

  card: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#1c1c1c',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  poster: {
    width: 100,
    height: 150,
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    color: '#aaa',
    marginTop: 4,
  },
});
