<script setup lang="ts">
import { CheckCircle2, ShieldAlert, XCircle, Zap } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { isShow, msg, toastType } = useToast()

// 映射文案标题
const labelMap = {
  success: '成功',
  warning: '警告',
  error: '错误'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-pop">
      <div v-if="isShow" class="toast-wrapper" :class="[`is-${toastType}`]">
        <div class="toast-inner center-layout">

          <div class="icon-container">
            <Transition name="icon-fade" mode="out-in">
              <CheckCircle2 v-if="toastType === 'success'" :size="24" class="status-icon success" />
              <ShieldAlert v-else-if="toastType === 'warning'" :size="24" class="status-icon warn" />
              <XCircle v-else :size="24" class="status-icon error" />
            </Transition>
          </div>

          <div class="content-box">
            <div class="terminal-header centered">
              <Zap :size="10" class="zap-icon" />
              <span class="system-label">{{ labelMap[toastType] }}</span>
            </div>
            <p class="message-text centered">{{ msg }}</p>
          </div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" :class="[`${toastType}-bg`]"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 60px; /* 稍微调低一点，视觉上更稳 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  min-width: 380px; /* 增加一点宽度适配长标题 */
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(20px) saturate(150%);
  border-radius: 16px;
  padding: 12px 16px;
  border: 1px solid transparent;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

/* --- 核心布局：改为垂直排列并居中 --- */
.center-layout {
  display: flex;
  flex-direction: column; /* 👈 改为纵向排列 */
  align-items: center;    /* 👈 水平居中 */
  gap: 8px;
}

.content-box {
  width: 100%;
}

.terminal-header.centered {
  display: flex;
  align-items: center;
  justify-content: center; /* 👈 标题栏内部居中 */
  gap: 8px;
  margin-bottom: 8px;
}

.message-text.centered {
  text-align: center;      /* 👈 文案文字居中 */
  margin: 0;
  color: #fff;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 500;
}

/* --- 状态颜色 --- */
.is-success { border-color: rgba(0, 255, 170, 0.4); }
.is-warning { border-color: rgba(255, 191, 0, 0.4); }
.is-error   { border-color: rgba(255, 77, 79, 0.4); }

.status-icon.success { color: #00ffaa; filter: drop-shadow(0 0 8px #00ffaa); }
.status-icon.warn    { color: #ffbf00; filter: drop-shadow(0 0 8px #ffbf00); }
.status-icon.error   { color: #ff4d4f; filter: drop-shadow(0 0 8px #ff4d4f); }

.success-bg { background: #00ffaa; }
.warning-bg { background: #ffbf00; }
.error-bg   { background: #ff4d4f; }

/* --- 装饰细节 --- */
.icon-container {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%; /* 圆形容器更适合垂直对齐 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-label {
  font-family: 'JetBrains Mono', monospace; /* 强制等宽字体 */
  font-size: 8px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
}

.progress-fill {
  height: 100%;
  width: 100%;
  animation: shrink 3s linear forwards;
}

@keyframes shrink { from { width: 100%; } to { width: 0%; } }

/* 进场动画：从上方滑入并略微放大 */
.toast-pop-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-pop-leave-active { transition: all 0.4s ease-in; }
.toast-pop-enter-from { opacity: 0; transform: translate(-50%, -40px) scale(0.9); }
.toast-pop-leave-to { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
</style>
