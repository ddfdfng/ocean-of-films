import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchFilteredMovies, fetchFilteredTV } from '../api/tmdb';

const { width } = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function ShowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const type = params.type === 'Серіали' ? 'tv' : 'movie';
  const genre = params.genre;
  const year = params.year;
  const country = params.country; // враховуємо країну

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        if (type === 'movie') {
          data = await fetchFilteredMovies({ genre, year, country });
        } else {
          data = await fetchFilteredTV({ genre, year, country });
        }
        setItems(data);
      } catch (error) {
        console.error('Помилка завантаження:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, genre, year, country]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      </SafeAreaView>
    );
  }

  if (!items || items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: '#fff' }}>Нічого не знайдено</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/details',
          params: { id: item.id.toString(), type },
        })
      }
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.poster}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || item.name}
        </Text>
        {item.vote_average ? (
          <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}/10</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Текст зверху */}
      <Text style={styles.headerText}>Результат за вибраними фільтрами</Text>

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={styles.carousel}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.45}
        decelerationRate="fast"
      />

      {/* Кнопка Назад */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={18} color="#000" />
        <Text style={styles.floatingBackText}>Назад</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#030f26', // темний фон
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    marginTop: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousel: {
    paddingLeft: 15,
    paddingBottom: 0,
    paddingTop: 90,
    height: 290,
  },
  card: {
    width: width * 0.42,
    height: 285,
    backgroundColor: '#062152ff',
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 15,
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    height: width * 0.6, // зменшена висота
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  cardInfo: {
    padding: 6,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  rating: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
  floatingBackButton: {
    position: 'absolute',
    bottom: '35%', // трохи нижче центру
    left: width / 2 - 60,
    width: 120,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 22.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBackText: {
    marginLeft: 6,
    fontWeight: 'bold',
    color: '#000',
    fontSize: 15,
  },
});
