import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchImages, fetchMovieCredits, fetchMovieDetails, fetchYoutubeTrailer } from '../api/tmdb';

const { width } = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function DetailsScreen() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const [details, setDetails] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const contentType = type as 'movie' | 'tv';
      const [detailData, creditsData, imagesData, trailerUrl] = await Promise.all([
        fetchMovieDetails(id as string, contentType),
        fetchMovieCredits(id as string, contentType),
        fetchImages(id as string, contentType),
        fetchYoutubeTrailer(id as string, contentType),
      ]);

      setDetails(detailData);
      setCast(creditsData.cast?.slice(0, 5) || []);
      setImages((imagesData.backdrops || []).filter((img: any) => img.file_path));
      setYoutubeUrl(trailerUrl);
      setLoading(false);
    };
    load();
  }, [id, type]);

  if (loading || !details) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  const openYoutube = () => {
    if (youtubeUrl) Linking.openURL(youtubeUrl);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
      {/* Кнопка Назад */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color="#000" />
        <Text style={styles.backText}>Назад</Text>
      </TouchableOpacity>

      {/* Карусель зображень */}
      <FlatList
        data={images}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) =>
          item.file_path ? (
            <Image
              source={{ uri: `${IMAGE_BASE_URL}${item.file_path}` }}
              style={styles.carouselImage}
            />
          ) : null
        }
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
      />

      {/* Назва */}
      <Text style={styles.title}>{details.title || details.name}</Text>

      {/* Короткий опис */}
      <Text style={styles.sectionTitle}>📝 Про що:</Text>
      <Text style={styles.overview}>{details.overview || 'Опис відсутній.'}</Text>

      {/* Головні ролі */}
      <Text style={styles.sectionTitle}>🎭 У головних ролях:</Text>
      <View style={styles.castList}>
        {cast.map((person) => (
          <View key={person.id} style={styles.castItem}>
            {person.profile_path ? (
              <Image
                source={{ uri: `${IMAGE_BASE_URL}${person.profile_path}` }}
                style={styles.castImage}
              />
            ) : (
              <View
                style={[
                  styles.castImage,
                  { backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <Ionicons name="person-outline" size={30} color="#888" />
              </View>
            )}
            <Text style={styles.castName}>{person.name}</Text>
          </View>
        ))}
      </View>

      {/* Кнопка перегляду */}
      {youtubeUrl && (
        <TouchableOpacity style={styles.watchButton} onPress={openYoutube}>
          <Ionicons name="logo-youtube" size={22} color="#fff" />
          <Text style={styles.watchButtonText}>Переглянути</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030f26', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 22,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  backText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },

  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 20 },

  carousel: { marginTop: 10 },
  carouselImage: {
    width: width * 0.7,
    height: width * 0.4,
    borderRadius: 12,
    marginHorizontal: 10,
  },

  sectionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginHorizontal: 20, marginTop: 25 },
  overview: { color: '#ccc', marginHorizontal: 20, marginTop: 10, fontSize: 15, lineHeight: 22 },

  castList: { flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 },
  castItem: { alignItems: 'center', marginHorizontal: 10 },
  castImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 5, backgroundColor: '#222' },
  castName: { color: '#fff', fontSize: 12, textAlign: 'center' },

  watchButton: {
    backgroundColor: '#ff0000ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 30,
    textAlign: 'center',
  },
  watchButtonText: { color: '#000', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
