export const queryOllama = async (prompt) => {
  try {
    const response = await fetch('https://281a-138-84-3-57.ngrok-free.app/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false
      }),
    });

    const text = await response.text();
    console.log('RAW:', text);
    const data = JSON.parse(text);
    return data.response;
  } catch (error) {
    console.error('Error querying Ollama:', error);
    return 'Error connecting to AI server.';
  }
};
