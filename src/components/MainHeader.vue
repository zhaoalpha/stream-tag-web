<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { useAI } from '@/composables/useAI' // 💡 1. 引入 AI 逻辑控制
// 引入具有科技感的图标
import {
  Tags,
  Users,
  Zap,
  MonitorPlay,
  Bot,
  Home,
} from 'lucide-vue-next'

interface NavItem {
  id: string
  label: string
  icon: any
}

const props = defineProps<{
  activeId?: string
}>()

const emit = defineEmits(['change'])

// 💡 2. 激活 AI 对话状态
const { toggleChat, isChatOpen } = useAI()

const navItems = ref<NavItem[]>([
  { id: 'home', label: '首页', icon: markRaw(Home) },
  { id: 'tag', label: '标签工作台', icon: markRaw(Tags) },
  { id: 'segment', label: '分群矩阵', icon: markRaw(Users) },
  { id: 'reach', label: '触达中枢', icon: markRaw(Zap) },
  { id: 'insight', label: '以太全景', icon: markRaw(MonitorPlay) },
])

const handleNavClick = (id: string) => {
  emit('change', id)
}
</script>

<template>
  <header class="main-header">
    <div class="logo-section">
      <div class="logo-glow"></div>
      <span class="logo-main">STREAM TAG</span>
      <span class="logo-sub">QUANT GROUP</span>
    </div>

    <nav class="nav-capsule">
      <div
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeId === item.id }"
        @click="handleNavClick(item.id)"
      >
        <component :is="item.icon" :size="14" class="nav-icon" />
        <span class="nav-text">{{ item.label }}</span>
      </div>
    </nav>

    <div class="user-section">
      <div
        class="user-avatar"
        :class="{ 'ai-active': isChatOpen }"
        @click="toggleChat"
      >
        <Bot :size="18" />

        <div v-if="isChatOpen" class="ai-status-indicator"></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ... 你之前的 header、logo、nav 样式保持不变 ... */
.main-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo-section { display: flex; align-items: baseline; position: relative; }
.logo-main { font-weight: 700; letter-spacing: 2px; font-size: 15px; color: #fff; }
.logo-sub { background: rgba(255, 255, 255, 0.9); color: #050505; font-size: 9px; font-weight: 800; margin-left: 10px; padding: 1px 6px; border-radius: 3px; transform: translateY(1px); flex-shrink: 0; }
.nav-capsule { display: flex; background: rgba(255, 255, 255, 0.02); padding: 4px; border-radius: 100px; border: 1px solid rgba(255, 255, 255, 0.05); }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 12px; color: rgba(255, 255, 255, 0.4); cursor: pointer; border-radius: 100px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.nav-item.active { background: rgba(255, 255, 255, 0.08); color: #fff; }

/* 🚀 重点改造：用户头像 AI 终端样式 */
.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-avatar:hover {
  border-color: rgba(0, 255, 170, 0.4);
  color: #00ffaa;
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.1);
  transform: scale(1.05);
}

/* 💡 AI 激活状态：切换为系统主题绿 */
.user-avatar.ai-active {
  border-color: #00ffaa;
  color: #00ffaa;
  background: rgba(0, 255, 170, 0.05);
  box-shadow:
    0 0 20px rgba(0, 255, 170, 0.2),
    inset 0 0 10px rgba(0, 255, 170, 0.1);
}

/* 💡 状态指示灯（呼吸动画） */
.ai-status-indicator {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  background: #00ffaa;
  border: 2px solid #050505;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ffaa;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(0.9); opacity: 1; }
}
</style>
