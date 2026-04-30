const enviar = async () => {
  const pergunta = userInput.value.trim();
  if (!pergunta || loading.value) return;

  messages.push({ texto: pergunta, tipo: 'user' });
  userInput.value = '';
  scrollToBottom();
  loading.value = true;

  try {
    // 🔴 MUDANÇA AQUI: Aponta para o nosso próprio back-end na Vercel
    const response = await axios.post('/api/chat', {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...memory.slice(-6),
        { role: "user", content: pergunta }
      ]
    });

    // O back-end repassa a resposta limpa para cá
    const respostaIA = response.data.choices[0].message.content;

    messages.push({ texto: respostaIA, tipo: 'bot' });
    memory.push({ role: "user", content: pergunta });
    memory.push({ role: "assistant", content: respostaIA });

  } catch (error) {
    console.error(error);
    messages.push({ texto: "❌ Erro ao conectar com o servidor.", tipo: 'bot' });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};