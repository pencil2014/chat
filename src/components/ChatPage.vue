<template>
  <div class="chat-container">
    <div class="message-list">
      <div v-for="(message, index) in messages" :key="index" class="message"
        :class="{ 'user': message.role === 'user', 'assistant': message.role === 'assistant' }">
        <img :src="message.role === 'user' ? '/assets/user-avatar.svg' : '/assets/assistant-avatar.svg'" class="avatar"
          :class="{ 'avatar-right': message.role === 'user', 'avatar-left': message.role === 'assistant' }" />
        <div class="content" v-html="parseMarkdown(message.content)"></div>
      </div>
    </div>
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="输入消息..." />
      <button @click="sendMessage" :disabled="isLoading">
        <svg v-if="isLoading" class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from '../utils/request';
import { marked } from 'marked';
import hljs from 'highlight.js';

const messages = ref([]);
const newMessage = ref('');
const isLoading = ref(false);
const displayContents = ref({});

// 打字效果逻辑
function typeWriterEffect(messageId, content) {
  let index = 0;
  displayContents.value[messageId] = '';

  const timer = setInterval(() => {
    if (index < content.length) {
      displayContents.value[messageId] = content.substring(0, index + 1);
      index++;
    } else {
      clearInterval(timer);
    }
  }, 32);
}

async function sendMessage() {
  if (!newMessage.value.trim() || isLoading.value) return;

  messages.value.push({ role: 'user', content: newMessage.value.trim() });
  const userMessage = newMessage.value;
  newMessage.value = '';
  isLoading.value = true;

  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-reasoner',
      messages: messages.value
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_KEY}`
      }
    });

    const assistantMessage = {
      role: 'assistant',
      content: response.data.choices[0].message.content,
      id: Date.now()
    };
    messages.value.push(assistantMessage);
    typeWriterEffect(assistantMessage.id, assistantMessage.content);
  } catch (error) {
    console.error('请求失败:', error);
    messages.value.push({ role: 'assistant', content: '请求出错，请稍后再试' });
  } finally {
    isLoading.value = false;
  }
}

// 配置marked解析器
marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  sanitize: true
});

const parseMarkdown = (content) => {
  return marked(content);
};
</script>

<style scoped>
.chat-container {
  margin: 0 auto;
  padding: 20px;
}

.message-list {
  height: 60vh;
  width: 60vw;
  overflow-y: auto;
  border: 1px solid #eee;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 10px 0;
  padding: 5px 20px;
  border-radius: 16px;
  max-width: 80%;
  transition: all 0.3s ease;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-right {
  order: 2;
  margin-left: 12px;
}

.avatar-left {
  order: 0;
  margin-right: 12px;
}

.content {
  flex: 1;
  text-align: left;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards, typing 1s steps(40) forwards;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes typing {
  from {
    width: 0
  }

  to {
    width: 100%
  }
}

@keyframes fadeIn {
  to {
    opacity: 1
  }
}

.message.user {
  background: #e3f2fd;
  margin-left: auto;
  margin-right: 5%;
}

.message.assistant {
  background: #f5f5f5;
  margin-right: 5%;
}

.input-area {
  display: flex;
  gap: 15px;
  max-width: 60vw;
  margin: 0 auto;
  padding: 15px 0;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  position: relative;
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.spinner {
  width: 10px;
  height: 10px;
  display: inline-block;
  vertical-align: middle;
  /* stroke: #2196F3; */
  border: 1px solid #fff;
}

button:disabled {
  background: #90caf9;
  cursor: not-allowed;
  opacity: 0.8;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

button:disabled svg {
  animation: spin 1s linear infinite;
}

.content :deep(pre) {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 10px 0;
}

.content :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .message-list {
    width: 90vw;
    height: 70vh;
  }

  .input-area {
    width: 90vw;
  }
}
</style>
