import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { searchMoviesOrTV } from '../api/tmdb';

const { width, height } = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const inputTop = useRef(new Animated.Value(height / 2 - 22)).current; // центр по Y

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const data = await searchMoviesOrTV(query);
    setResults(data);
    setLoading(false);

    // Піднімаємо інпут, якщо є результати
    if (data.length > 0) {
      Animated.timing(inputTop, {
        toValue: 80, // під заголовком
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  };

  const filteredResults =
    typeFilter === 'all'
      ? results
      : results.filter((item) => item.media_type === typeFilter);

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: '/details',
          params: { id: item.id.toString(), type: item.media_type },
        });
      }}
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
    <View style={styles.container}>
      {/* Заголовок */}
      <Text style={styles.pageTitle}>
        <Ionicons name="search" size={20} color="#fff" /> Пошук
      </Text>

      {/* Пошуковий рядок */}
      <Animated.View style={[styles.searchRow, { top: inputTop }]}>
        <TextInput
          placeholder="Введіть назву фільму чи серіалу"
          placeholderTextColor="#999"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Ionicons name="search" size={22} color="#030f26" />
        </TouchableOpacity>
      </Animated.View>

      {/* Надпис "Нічого не знайдено" прямо під інпутом */}
      {query.trim() !== '' && !loading && filteredResults.length === 0 && (
        <Text style={styles.noResultsUnderInput}>Нічого не знайдено</Text>
      )}

      {/* Фільтр типу */}
      {results.length > 0 && (
        <View style={styles.filterRow}>
          {['all', 'movie', 'tv'].map((type) => {
            const label =
              type === 'all' ? 'Усі' : type === 'movie' ? 'Фільми' : 'Серіали';
            const selected = typeFilter === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setTypeFilter(type as any)}
                style={[styles.filterButton, selected && styles.filterButtonSelected]}
              >
                <Text
                  style={[styles.filterText, selected && styles.filterTextSelected]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Результати */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : filteredResults.length > 0 ? (
        <FlatList
          horizontal
          data={filteredResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.carousel}
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.45}
          decelerationRate="fast"
          style={{ flexGrow: 0 }}
        />
      ) : null}

      {/* Плаваюча кнопка "Назад" */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={16} color="#030f26" />
        <Text style={styles.floatingBackText}>Назад</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030f26',
  },
  pageTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
  },
  searchRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#062152ff',
    color: '#fff',
    paddingHorizontal: 14,
    borderRadius: 25,
    height: 44,
  },
  searchBtn: {
    backgroundColor: '#fff',
    padding: 10,
    marginLeft: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsUnderInput: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    position: 'absolute',
    left: 16,
    right: 16,
    top: height / 2 + 30, // під інпутом
    zIndex: 5,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    marginTop: 80,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#062152ff',
  },
  filterButtonSelected: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#aaa',
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#000',
  },
  carousel: {
    paddingLeft: 15,
    paddingBottom: 30,
  },
  card: {
    width: width * 0.42,
    backgroundColor: '#062152ff',
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 15,
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    height: width * 0.6,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  cardInfo: {
    padding: 8,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  rating: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  floatingBackButton: {
    position: 'absolute',
    bottom: 100,
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
