import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_KEY = 'b53e87d6d9e6dd2ea9fd63e73fe99e4c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function DetailsScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !type) return;

    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,watch/providers`
        );
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error('Помилка при отриманні деталей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Фільм або серіал не знайдено</Text>
      </View>
    );
  }

  const actors = movie.credits?.cast?.slice(0, 5) || [];
  const providers = movie['watch/providers']?.results?.UA?.flatrate || [];
  const youtubeProviders = movie['watch/providers']?.results?.UA?.buy?.filter(
    (p: any) => p.provider_name.toLowerCase() === 'youtube'
  ) || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>← Назад</Text>
      </TouchableOpacity>

      <Image
        source={{ uri: `${IMAGE_BASE_URL}${movie.poster_path}` }}
        style={styles.poster}
      />

      <Text style={styles.title}>{movie.title || movie.name}</Text>

      <Text style={styles.overview}>{movie.overview}</Text>

      <Text style={styles.sectionTitle}>🎭 В головних ролях:</Text>
      <View style={styles.actorsContainer}>
        {actors.map((actor: any) => (
          <Text key={actor.cast_id || actor.credit_id} style={styles.actorName}>
            {actor.name}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>📺 Доступно на платформах:</Text>
      <View style={styles.platformsContainer}>
        {providers.length === 0 && youtubeProviders.length === 0 && (
          <Text style={{ color: '#fff' }}>Немає доступних платформ для перегляду в Україні</Text>
        )}

        {providers.map((provider: any) => (
          <Text key={provider.provider_id} style={styles.platformText}>
            {provider.provider_name}
          </Text>
        ))}

        {youtubeProviders.length > 0 && (
          <Text style={[styles.platformText, { fontWeight: 'bold', marginTop: 10 }]}>
            Також доступно на YouTube
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  container: {
    backgroundColor: '#000',
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
  },
  poster: {
    width: '100%',
    height: 500,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  overview: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  actorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  actorName: {
    color: '#bbb',
    fontSize: 14,
    marginRight: 15,
    marginBottom: 5,
  },
  platformsContainer: {
    marginBottom: 20,
  },
  platformText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
});
