import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigator from '../components/Navigator';
import TitleModal from '../components/Modal';

export default function DreamInput() {
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = () => {
    if (!body.trim()) return;
    setShowModal(true);
  };

  const saveDream = async () => {
    if (!title.trim()) return;

    const mood = 'unknown';

    const newDream = {
      id: Date.now(),
      title: title.trim(),
      text: body,
      mood,
    };

    const existing = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
    existing.push(newDream);
    await AsyncStorage.setItem('dreams', JSON.stringify(existing));

    setBody('');
    setTitle('');
    setShowModal(false);
    Alert.alert('Saved', 'Dream saved successfully');
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Write your dream..."
        value={body}
        onChangeText={setBody}
        multiline
        style={styles.input}
        onSubmitEditing={handleSubmit}
        blurOnSubmit
      />

      <TitleModal
        visible={showModal}
        titleValue={title}
        onTitleChange={setTitle}
        onSave={saveDream}
        onCancel={() => setShowModal(false)}
      />

      <Navigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, minHeight: 150, marginBottom: 20 },
});
