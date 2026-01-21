// src/composables/useAI.ts
import { ref } from 'vue'

const isChatOpen = ref(false)
const userInput = ref('')

export function useAI() {
  const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value
  }

  const closeChat = () => {
    isChatOpen.value = false
    userInput.value = ''
  }

  return {
    isChatOpen,
    userInput,
    toggleChat,
    closeChat,
  }
}
