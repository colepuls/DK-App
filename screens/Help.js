import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import Navigator from '../components/Navigator';
import { queryOllama } from '../apis/Ollama';

const systemInstructions = `
  You are an assistant that helps users manage their dreams in a journaling app.

  You can answer questions like:
  - How many dreams do I have?
  - How many are tagged as "happy"?
  - How do I delete or edit a dream?

  To delete a dream, tap the three-dot menu on a dream card, then press the trash icon. Once the trash icon is pressed, the dream is deleted, there is no undo. There is no confirm to delete action prompt.
  To edit a dream's title, tap the same menu and press the pencil icon, then you will be prompted to edit the dream's title.

  Always respond with clear and friendly advice.
`;

export default function Help() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setPrompt('');

    const context = `
${systemInstructions}

User question: ${prompt}
    `;

    try {
      const res = await queryOllama(context);
      const aiMessage = { sender: 'ai', text: res };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errMessage = { sender: 'ai', text: 'Error contacting AI.' };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef}>
        {messages.map((m, i) => (
          <Text
            key={i}
            style={m.sender === 'user' ? styles.user : styles.ai}
          >
            {m.text}
          </Text>
        ))}
        {loading && <Text style={styles.loading}>Thinking...</Text>}
      </ScrollView>

      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Ask for help"
        placeholderTextColor="#888"
        style={styles.input}
      />
      <Button title="Send" onPress={handleAsk} disabled={loading || !prompt.trim()} />
      <Navigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    color: '#fff',
    margin: 4,
    padding: 8,
    borderRadius: 8,
  },
  ai: {
    alignSelf: 'flex-start',
    backgroundColor: '#444',
    color: '#fff',
    margin: 4,
    padding: 8,
    borderRadius: 8,
  },
  loading: { color: '#888', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    color: '#fff',
    borderRadius: 10,
    marginVertical: 10,
  },
});
