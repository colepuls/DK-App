import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import Navigator from '../components/Navigator';
import { queryOllama } from '../apis/Ollama';

export default function AIChat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    const userMessage = { sender: 'user', text: prompt };
    setMessages([...messages, userMessage]);
    setLoading(true);
    setPrompt('');

    const res = await queryOllama(prompt);
    setMessages(prev => [...prev, { sender: 'ai', text: res }]);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={bottomRef}>
        {messages.map((m, i) => (
          <Text key={i} style={m.sender === 'user' ? styles.user : styles.ai}>{m.text}</Text>
        ))}
        {loading && <Text>Thinking...</Text>}
      </ScrollView>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Ask me anything"
        style={styles.input}
      />
      <Button title="Send" onPress={handleAsk} disabled={loading} />
      <Navigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  user: { alignSelf: 'flex-end', backgroundColor: '#ccc', margin: 4, padding: 8 },
  ai: { alignSelf: 'flex-start', backgroundColor: '#eee', margin: 4, padding: 8 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10 },
});