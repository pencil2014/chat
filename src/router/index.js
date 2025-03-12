import { createRouter, createWebHistory } from 'vue-router'
import ChatPage from '../components/ChatPage.vue'

const routes = [
  {
    path: '/',
    name: 'Chat',
    component: ChatPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router