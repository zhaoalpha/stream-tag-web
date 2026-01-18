<script setup lang="ts">
import { ref, markRaw } from 'vue'
// 引入具有科技感的图标
import {
  Tags,
  Users,
  Zap,
  ShieldCheck,
  MonitorPlay, // 大屏展示图标
  User
} from 'lucide-vue-next'

interface NavItem {
  id: string
  label: string
  // 使用 markRaw 告诉 Vue 不需要对图标组件进行响应式代理，提升性能
  icon: any
}

const props = defineProps<{
  activeId?: string
}>()

const emit = defineEmits(['change'])

const navItems = ref<NavItem[]>([
  { id: 'tag', label: '标签工作台', icon: markRaw(Tags) },
  { id: 'segment', label: '分群矩阵', icon: markRaw(Users) },
  { id: 'reach', label: '触达中枢', icon: markRaw(Zap) },
  { id: 'strategy', label: '策略演练', icon: markRaw(ShieldCheck) },
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
      <span class="logo-sub">QUANTGROUP</span>
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
      <div class="user-avatar">
        <User :size="18" />
      </div>
    </div>
  </header>
</template>

<style scoped>
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

.logo-section {
  display: flex;
  /* 关键：改为基线对齐，方便控制高度差 */
  align-items: baseline;
  position: relative;
}

.logo-main {
  font-weight: 700;
  letter-spacing: 2px;
  font-size: 15px; /* 略微加大主标题 */
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.logo-sub {
  /* 变为白色实心 */
  background: rgba(255, 255, 255, 0.9);
  color: #050505; /* 深色文字 */

  font-size: 9px;
  font-weight: 800; /* 加粗实心标签内的文字 */
  margin-left: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  letter-spacing: 0.5px;

  /* 关键：位置微调，使其略低于主标题的视觉水平线 */
  transform: translateY(1px);
  flex-shrink: 0;

  /* 消除边框 */
  border: none;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
}

/* 装饰性光晕也改为暗白色 */
.logo-glow {
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  left: -15px;
  top: -10px;
  pointer-events: none;
}

/* 导航胶囊优化：支持 5 个项 */
.nav-capsule {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.02);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  border-radius: 100px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-icon {
  opacity: 0.6;
  transition: transform 0.3s ease;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.03);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  /* 激活时图标带微光 */
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
}

.nav-item.active .nav-icon {
  opacity: 1;
  color: rgba(255, 255, 255, 0.9); /* 暗白色 */
  transform: scale(1.1);
  /* 银白色微光：非常克制 */
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.nav-item.active .nav-text {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

/* 用户头像 */
.user-avatar:hover {
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}
.user-avatar:hover {
  border-color: rgba(0, 255, 170, 0.4);
  color: #fff;
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.1);
}
</style>
