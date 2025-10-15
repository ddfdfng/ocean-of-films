import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = {
  type: ['Фільми', 'Серіали'],
  genre: ['Драма', 'Комедія', 'Бойовик', 'Фантастика'],
  year: ['2025', '2024', '2023', '2022', '2021'],
  country: ['США', 'Велика Британія', 'Україна'],
};

export default function FiltersScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState({
    type: '',
    genre: '',
    year: '',
    country: '',
  });

  const toggle = (category: keyof typeof FILTERS, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  const isShowEnabled = Object.values(selected).some((v) => v !== '');
  const selectedCount = Object.values(selected).filter((v) => v !== '').length;

  const onShowPress = () => {
    const params = Object.entries(selected)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    router.push(`/show?${params}`);
  };

  return (
    <View style={styles.wrapper}>
      {/* Назад */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#000" />
        <Text style={styles.backText}>Назад</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {Object.entries(FILTERS).map(([category, values]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category.toUpperCase()}</Text>
            <View style={styles.row}>
              {values.map((value) => {
                const selectedValue = selected[category as keyof typeof FILTERS] === value;
                return (
                  <TouchableOpacity key={value} onPress={() => toggle(category as keyof typeof FILTERS, value)}>
                    <View style={[styles.option, selectedValue && styles.optionSelected]}>
                      <Text style={[styles.optionText, selectedValue && styles.optionTextSelected]}>
                        {value}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Кнопка Показати */}
      <SafeAreaView edges={['bottom']} style={{ padding: 10 }}>
        <TouchableOpacity
          style={[styles.showButton, !isShowEnabled && styles.showButtonDisabled]}
          disabled={!isShowEnabled}
          onPress={onShowPress}
        >
          <Text style={[styles.showButtonText, isShowEnabled && { color: '#000' }]}>
            Показати
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#030f26', paddingTop: 50, paddingHorizontal: 20 },
  backButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 22,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  section: { marginBottom: 25 },
  sectionTitle: { color: '#888', fontWeight: '600', marginBottom: 12, fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { backgroundColor: '#062152ff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, marginRight: 10, marginBottom: 10 },
  optionSelected: { backgroundColor: '#fff' },
  optionText: { color: '#bbb', fontWeight: '600' },
  optionTextSelected: { color: '#000' },
  showButton: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  showButtonDisabled: { backgroundColor: '#444' },
  showButtonText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
});
