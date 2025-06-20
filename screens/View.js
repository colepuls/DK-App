import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigator from '../components/Navigator';

export default function DreamView({ route }) {
  const { id } = route.params;
  const [dream, setDream] = useState(null);

  useEffect(() => {
    (async () => {
      const dreams = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
      const found = dreams.find(d => d.id === id);
      setDream(found);
    })();
  }, [id]);

  if (!dream) return <Text style={styles.error}>Dream not found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dream.title}</Text>
      <Text style={styles.text}>{dream.text}</Text>
      <Navigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
  text: { fontSize: 18, color: '#ccc' },
  error: { padding: 20, color: 'red' },
});
