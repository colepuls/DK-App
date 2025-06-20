import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigator from '../components/Navigator';
import TitleModal from '../components/Modal';
import { queryOllama } from '../apis/Ollama';

export default function Create() {
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = () => {
    if (!body.trim()) return;
    setShowModal(true);
  };

  const saveDream = async () => {
    if (!title.trim()) return;

    let mood = 'unknown';
    try {
      const aiPrompt = `What is the mood of the following dream? Respond with ONLY A ONE word tag like scary, sad, happy, confusing, peaceful, eye-opening. Again you should respond with only the tag, nothing else.\n\n${body}`;
      const response = await queryOllama(aiPrompt);
      mood = response.trim().toLowerCase();
    } catch (err) {
      console.error('Failed to get mood from AI:', err);
    }

    const newDream = {
      id: Date.now(),
      title: title.trim(),
      text: body,
      mood,
    };

    try {
      const existing = JSON.parse(await AsyncStorage.getItem('dreams')) || [];
      existing.push(newDream);
      await AsyncStorage.setItem('dreams', JSON.stringify(existing));
      setBody('');
      setTitle('');
      setShowModal(false);
      Alert.alert('Saved', `Dream saved successfully with mood: ${mood}`);
    } catch (err) {
      console.error('Error saving dream:', err);
      Alert.alert('Error', 'Failed to save dream.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Write your dream..."
        placeholderTextColor="#888"
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
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 16,
    minHeight: 200,
    color: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
});
