<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

// 定义组件接收的参数
defineProps<{
  show: boolean;
  title: string;
  message: string;
}>();

// 定义事件
const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
        <div class="modal-content">
          <div class="modal-icon">
            <AlertTriangle :size="32" />
          </div>
          <h3 class="modal-title">{{ title }}</h3>
          <p class="modal-text">{{ message }}</p>

          <div class="modal-actions">
            <button class="modal-btn ghost" @click="emit('cancel')">取消</button>
            <button class="modal-btn danger" @click="emit('confirm')">确认删除</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层：全屏变暗并模糊背景 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 弹窗主体：纯正毛玻璃感 */
.modal-content {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  width: 360px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  color: #ff4d4d;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.modal-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin-bottom: 24px;
}

/* 按钮布局 */
.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.ghost {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-btn.danger {
  background: #ff4d4d;
  border: none;
  color: #fff;
}

.modal-btn.danger:hover {
  background: #ff3333;
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.4);
}

/* 进场/退场动画 */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content {
  transform: scale(0.9) translateY(20px);
}
</style>
