<script setup>
import { ref, reactive, nextTick } from 'vue';
import axios from 'axios';

// --- CONFIGURAÇÕES GROQ ---
const GROQ_API_KEY = import.meta.env.VITE_GROQ_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// --- ESTADO REATIVO ---
const userInput = ref('');
const loading = ref(false);
const chatContainer = ref(null);
const messages = reactive([]); // Histórico visível
const memory = reactive([]);   // Memória para a IA

const systemPrompt = `Você é um assistente educacional de TI. 
Responda APENAS perguntas sobre TI. 
Se fugir do tema, diga: "❌ Este assistente responde apenas dúvidas de TI."
Use emojis: 📘 conceito, ⚙️ características, 💻 exemplos, 🚀 vantagens.`;

// --- MÉTODOS ---
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const enviar = async () => {
  const pergunta = userInput.value.trim();
  if (!pergunta || loading.value) return;

  // 1. Adiciona mensagem do usuário na tela
  messages.push({ texto: pergunta, tipo: 'user' });
  userInput.value = '';
  scrollToBottom();

  loading.value = true;

  try {
    // 2. Prepara o envio para a Groq (formato OpenAI)
    const response = await axios.post(API_URL, {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...memory.slice(-6), // Contexto das últimas mensagens
        { role: "user", content: pergunta }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const respostaIA = response.data.choices[0].message.content;

    // 3. Atualiza interface e memória
    messages.push({ texto: respostaIA, tipo: 'bot' });
    memory.push({ role: "user", content: pergunta });
    memory.push({ role: "assistant", content: respostaIA });

  } catch (error) {
    console.error(error);
    messages.push({ texto: "❌ Erro ao conectar com a Groq. Verifique sua chave.", tipo: 'bot' });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};
</script>

<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <div class="sidebar-header">📥 Conversas</div>
      <div class="chat-list">
        <div class="chat-item active">Sessão de TI</div>
      </div>
    </aside>

    <main class="main">
      <header class="header">Chat Educacional (Groq Cloud)</header>

      <div class="aviso">
        ⚠️ Apenas perguntas de Tecnologia da Informação
      </div>

      <div id="chat" ref="chatContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['msg', msg.tipo]"
          style="white-space: pre-wrap;" 
        >
          {{ msg.texto }}
        </div>
        
        <div v-if="loading" class="msg bot">...</div>
      </div>

      <footer class="footer">
        <input 
          v-model="userInput" 
          @keyup.enter="enviar"
          placeholder="Tire sua dúvida de TI..." 
          :disabled="loading"
        />
        <button @click="enviar" :disabled="loading">
          {{ loading ? '...' : 'Enviar' }}
        </button>
      </footer>
    </main>

    <aside class="info">
      <h3>👤 Informações</h3>
      <p><b>IA:</b> Llama 3.3 70B</p>
      <p><b>Status:</b> <span class="status-online">Online</span></p>
      <p><b>Área:</b> TI</p>
    </aside>
  </div>
</template>

<style scoped>
/* (O mesmo CSS que você postou funciona perfeitamente aqui) */
.app-wrapper { display: flex; height: 100vh; width: 100%; background: #eef2f7; color: #333; }
.sidebar { width: 280px; background: #fff; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; }
.sidebar-header { padding: 15px; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
.chat-item { padding: 12px; border-bottom: 1px solid #f1f1f1; cursor: pointer; }
.chat-item.active { background: #f3f4f6; border-left: 4px solid #4f46e5; }
.main { flex: 1; display: flex; flex-direction: column; background: #f9fafb; }
.header { background: #fff; padding: 15px; border-bottom: 1px solid #e5e7eb; font-weight: 600; }
#chat { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
.msg { max-width: 70%; padding: 12px 14px; border-radius: 10px; font-size: 14px; line-height: 1.4; word-wrap: break-word; }
.user { align-self: flex-end; background: #4f46e5; color: #fff; border-bottom-right-radius: 2px; }
.bot { align-self: flex-start; background: #e5e7eb; color: #1f2937; border-bottom-left-radius: 2px; }
.footer { display: flex; padding: 15px; background: #fff; border-top: 1px solid #e5e7eb; }
input { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; outline: none; }
button { margin-left: 10px; padding: 12px 20px; border: none; background: #4f46e5; color: #fff; border-radius: 8px; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.info { width: 280px; background: #fff; border-left: 1px solid #e5e7eb; padding: 15px; }
.info h3 { margin-bottom: 15px; font-size: 14px; }
.info p { font-size: 13px; margin-bottom: 10px; }
.status-online { color: #10b981; font-weight: bold; }
.aviso { background: #fde68a; text-align: center; padding: 8px; font-size: 13px; color: #92400e; }
</style>