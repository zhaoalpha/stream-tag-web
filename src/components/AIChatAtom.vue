<script setup lang="ts">
import { useAI } from '@/composables/useAI'
import { useStrategyEngine } from '@/composables/useStrategyEngine'
import { useToast } from '@/composables/useToast'
import { Send, TerminalSquare, X } from 'lucide-vue-next'

const { isChatOpen, userInput, closeChat } = useAI()
const { injectSpecificTag } = useStrategyEngine()
import { useArchives } from '@/composables/useArchives'
const { saveStrategy } = useArchives()
const toast = useToast()

/**
 * 🚀 自动化执行核心
 */
const handleConfirm = async () => {
  const prompt = userInput.value.trim() || 'AI 自动生成的交易策略'

  try {
    // 1. 执行注入：画布立刻出现 [交易金额 > 5000]
    const updatedLogicData = injectSpecificTag()

    // 2. 准备存档数据
    const payload = {
      title: `AI助手: ${prompt.slice(0, 10)}${prompt.length > 10 ? '...' : ''}`
    }

    // 3. 自动触发后端/存档保存 (假设当前表名为 USER_PROFILE，可动态获取)
    // 注意：这里传入 injectSpecificTag 返回的最新逻辑数据
    const result = await saveStrategy(payload, updatedLogicData, 'USER_PROFILE')

    if (result.success) {
      toast.success('AI 已完成逻辑编排并自动同步至历史存档')
    } else {
      toast.warning('逻辑已注入画布，但存档同步失败，请手动保存')
    }
  } catch (error) {
    console.error('AI 自动化链路异常:', error)
    toast.error('核心指令执行发生故障')
  } finally {
    // 4. 无论成功失败，关闭 AI 面板
    closeChat()
  }
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeChat()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="isChatOpen" class="ai-chat-overlay" @click="handleOverlayClick">
        <div class="ai-chat-panel">
          <div class="panel-header">
            <TerminalSquare :size="16" class="header-icon" />
            <span class="header-title">AETHER COGNITIVE ASSISTANT</span>
            <button class="close-btn" @click="closeChat">
              <X :size="18" />
            </button>
          </div>

          <div class="input-area">
            <textarea
              v-model="userInput"
              placeholder="输入您的指令 (例如：创建高价值用户标签...)"
              @keydown.enter.prevent="handleConfirm"
            ></textarea>

            <button class="confirm-btn" @click="handleConfirm">
              <Send :size="16" />
              <span>执行指令 / EXECUTE</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 💡 强制所有元素使用怪异盒模型，防止 padding 撑破宽度 */
* {
  box-sizing: border-box;
}

.ai-chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-chat-panel {
  width: 420px; /* 宽度适中 */
  background: rgba(12, 12, 12, 0.95);
  border: 1px solid rgba(0, 255, 170, 0.3);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 170, 0.1);
  position: relative;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.header-icon {
  color: #00ffaa;
  filter: drop-shadow(0 0 5px #00ffaa);
}

.header-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #00ffaa;
  letter-spacing: 1.5px;
  font-weight: 600;
}

.close-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s;
  padding: 4px;
  display: flex;
}

.close-btn:hover {
  color: #ff4d4f;
  transform: rotate(90deg);
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

textarea {
  width: 100%; /* 💡 配合 box-sizing 不再溢出 */
  height: 130px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  padding: 14px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.3s;
}

textarea:focus {
  border-color: rgba(0, 255, 170, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.confirm-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #00ffaa, #00d4ff);
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px -5px rgba(0, 255, 170, 0.4);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 12px 25px -5px rgba(0, 255, 170, 0.5);
}

/* 进出场动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
