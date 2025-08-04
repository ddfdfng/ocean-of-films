import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const options = {
  headerShown: false,
};

const FILTERS = {
  type: ['Фільми', 'Серіали'],
  genre: ['Драма', 'Комедія', 'Бойовик', 'Фантастика'],
};

export default function FiltersScreen() {
  const router = useRouter();

  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    genre: '',
  });

  const toggleFilter = (category: 'type' | 'genre', value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  const isShowEnabled = selectedFilters.type !== '' || selectedFilters.genre !== '';

  const onShowPress = () => {
    router.push(
      `/search?type=${encodeURIComponent(selectedFilters.type)}&genre=${encodeURIComponent(selectedFilters.genre)}`
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Назад</Text>
      </TouchableOpacity>

      {/* Фільтр Тип */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Тип</Text>
        <View style={styles.optionsRow}>
          {FILTERS.type.map((value) => {
            const selected = selectedFilters.type === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.optionButton, selected && styles.optionButtonSelected]}
                onPress={() => toggleFilter('type', value)}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Фільтр Жанр */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Жанр</Text>
        <View style={styles.optionsRow}>
          {FILTERS.genre.map((value) => {
            const selected = selectedFilters.genre === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.optionButton, selected && styles.optionButtonSelected]}
                onPress={() => toggleFilter('genre', value)}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Кнопка Показати */}
      <TouchableOpacity
        style={[styles.showButton, !isShowEnabled && styles.showButtonDisabled]}
        disabled={!isShowEnabled}
        onPress={onShowPress}
      >
        <Text style={[styles.showButtonText, isShowEnabled && { color: '#000' }]}>Показати</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },

  filterSection: {
    marginBottom: 30,
  },
  filterTitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  optionButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#fff',
  },

  optionText: {
    color: '#bbb',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#000',
  },

  showButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showButtonDisabled: {
    backgroundColor: '#777',
  },
  showButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
