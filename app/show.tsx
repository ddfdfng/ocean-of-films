import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { fetchFilteredMovies, fetchFilteredTV } from "../api/tmdb";

const { width, height } = Dimensions.get("window");
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function ShowScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const type = params.type === "Серіали" ? "tv" : "movie";
  const genre = params.genre;
  const sort = params.sort;
  const country = params.country;

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const swiperRef = useRef<Swiper<any>>(null);

  useEffect(() => {
    loadMoreCards(page);
  }, [type, genre, sort, country]);

  // Завантажуємо нові картки
  const loadMoreCards = async (pageToLoad: number) => {
    try {
      if (loadingMore) return;
      setLoadingMore(true);

      const filterParams: any = { genre, country, sort, page: pageToLoad };
      const data =
        type === "movie"
          ? await fetchFilteredMovies(filterParams)
          : await fetchFilteredTV(filterParams);

      if (data && data.length) {
        setCards(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }

    } catch (error) {
      console.error("Помилка завантаження:", error);
      Alert.alert("Помилка", "Не вдалося завантажити дані");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const addFavorite = async (card: any) => {
    try {
      const key = type === "movie" ? "favoritesMovies" : "favoritesTV";
      const stored = await AsyncStorage.getItem(key);
      let arr = stored ? JSON.parse(stored) : [];
      if (!arr.find((i: any) => i.id === card.id)) {
        arr.push(card);
        await AsyncStorage.setItem(key, JSON.stringify(arr));
        Alert.alert("❤️ Додано в обране", card.title || card.name);
      }
    } catch (e) {
      console.error("Error saving favorite", e);
    }
  };

  const handleSwipedBottom = (index: number) => {
    const card = cards[index];
    if (card) addFavorite(card);
  };

  const handleSwipedAll = () => {
    // Коли свайпнув всі, підвантажуємо наступну сторінку
    loadMoreCards(page);
  };

  if (loading && cards.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={{ marginTop: 10, color: "#555" }}>Завантаження...</Text>
      </View>
    );
  }

  if (!cards.length) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: "#777" }}>
          Нічого не знайдено 😕
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-circle" size={42} color="#fff" />
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        cards={cards}
        renderCard={(card) => (
          <View style={styles.cardContainer}>
            <ImageBackground
              source={{
                uri: card.poster_path
                  ? `${IMAGE_BASE_URL}${card.poster_path}`
                  : "https://via.placeholder.com/500x750?text=No+Image",
              }}
              style={styles.poster}
              imageStyle={{ borderRadius: 20 }}
            >
              <View style={styles.overlay}>
                <Text style={styles.title}>{card.title || card.name}</Text>
                <Text style={styles.info}>
                  ⭐ {card.vote_average?.toFixed(1)} |{" "}
                  {card.release_date || card.first_air_date || "Невідомо"}
                </Text>
                <Text style={styles.overview} numberOfLines={5}>
                  {card.overview || "Без опису"}
                </Text>
              </View>
            </ImageBackground>
          </View>
        )}
        onSwipedBottom={handleSwipedBottom}
        onSwipedAll={handleSwipedAll}
        stackSize={3}
        verticalSwipe={true}
        animateCardOpacity
        backgroundColor="#0d0d0d"
        cardVerticalMargin={20}
        disableTopSwipe
        disableLeftSwipe={false}
        disableRightSwipe={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardContainer: {
    width: width * 0.9,
    height: height * 0.75,
    borderRadius: 20,
    shadowColor: "#fff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: "hidden",
  },
  poster: { flex: 1, justifyContent: "flex-end" },
  overlay: { backgroundColor: "rgba(0,0,0,0.55)", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  info: { color: "#ffcc00", textAlign: "center", marginBottom: 6 },
  overview: { color: "#ccc", textAlign: "center", fontSize: 14 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backBtn: {
    flexDirection: "row",
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  backText: { color: "#fff", marginLeft: 8, fontSize: 16 },
});
