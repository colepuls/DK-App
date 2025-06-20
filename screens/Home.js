import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DreamCard from '../components/Card';
import Navigator from '../components/Navigator';
import TitleModal from '../components/Modal';

export default function Home() {
  const [dreams, setDreams] = useState([]);
  const [query, setQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    (async () => {
      const saved = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
      setDreams(saved);
    })();
  }, []);

  const handleDelete = async (id) => {
    const updated = dreams.filter(d => d.id !== id);
    setDreams(updated);
    await AsyncStorage.setItem('dreams', JSON.stringify(updated));
  };

  const handleEdit = (id) => {
    const dream = dreams.find(d => d.id === id);
    if (!dream) return;
    setCurrentId(id);
    setNewTitle(dream.title);
    setShowModal(true);
  };

  const saveEdit = async () => {
    if (!newTitle.trim()) return;
    const updated = dreams.map(d =>
      d.id === currentId ? { ...d, title: newTitle.trim() } : d
    );
    setDreams(updated);
    await AsyncStorage.setItem('dreams', JSON.stringify(updated));
    setShowModal(false);
    setNewTitle('');
    setCurrentId(null);
  };

  const filtered = dreams.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search dreams"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <DreamCard dream={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      />

      <TitleModal
        visible={showModal}
        titleValue={newTitle}
        onTitleChange={setNewTitle}
        onSave={saveEdit}
        onCancel={() => setShowModal(false)}
      />

      <Navigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});