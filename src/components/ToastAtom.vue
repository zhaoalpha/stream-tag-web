<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, ShieldAlert, Zap } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  message: string
}>()

/**
 * 如果消息包含“时间”、“注意”或“⚠️”，自动切换为琥珀黄警告风格
 */
const isWarning = computed(() => {
  const msg = props.message.toLowerCase()
  console.log('===',msg)
  return msg.includes('time') || msg.includes('注意') || msg.includes('⚠️') || msg.includes('毫秒')
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-pop">
      <div v-if="show" class="toast-wrapper" :class="{ 'is-warning': isWarning }">
        <div class="toast-inner">
          <div class="icon-container">
            <Transition name="icon-fade" mode="out-in">
              <ShieldAlert v-if="isWarning" :size="20" class="status-icon warn" />
              <CheckCircle2 v-else :size="20" class="status-icon success" />
            </Transition>
          </div>

          <div class="content-box">
            <div class="terminal-header">
              <Zap :size="10" class="zap-icon" />
              <span class="system-label">{{ isWarning ? 'SYSTEM ADVISORY' : 'TRANSACTION COMPLETE' }}</span>
            </div>
            <p class="message-text">{{ message }}</p>
          </div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" :class="{ 'warn-bg': isWarning }"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 核心容器：悬浮于银河之上  */
.toast-wrapper {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;

  min-width: 320px;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(0, 255, 170, 0.3); /* 默认成功绿边 */
  border-radius: 16px;
  padding: 16px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 255, 170, 0.05);
  overflow: hidden;
  transition: border-color 0.4s ease;
}

/* 警告状态覆盖样式 */
.toast-wrapper.is-warning {
  border-color: rgba(255, 191, 0, 0.4); /* 琥珀黄边框 */
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 191, 0, 0.05);
}

.toast-inner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

/* 图标容器 */
.icon-container {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.success { color: #00ffaa; filter: drop-shadow(0 0 5px rgba(0, 255, 170, 0.5)); }
.status-icon.warn { color: #ffbf00; filter: drop-shadow(0 0 5px rgba(255, 191, 0, 0.5)); }

/* 文本排版 */
.content-box {
  flex: 1;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.zap-icon { color: rgba(255, 255, 255, 0.4); }

.system-label {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1.5px;
}

.message-text {
  margin: 0;
  color: #fff;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 500;
}

/* 进度条动画  */
.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
}

.progress-fill {
  height: 100%;
  background: #00ffaa;
  width: 100%;
  animation: shrink 3.5s linear forwards; /* 稍长于 3s 确保平滑 */
}

.progress-fill.warn-bg { background: #ffbf00; }

@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* 进出场动画：轻微缩放+平移 */
.toast-pop-enter-from { opacity: 0; transform: translate(-50%, -40px) scale(0.95); }
.toast-pop-enter-to { opacity: 1; transform: translate(-50%, 0) scale(1); }
.toast-pop-leave-to { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
.toast-pop-enter-active, .toast-pop-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
