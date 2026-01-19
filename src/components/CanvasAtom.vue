<script setup lang="ts">
/**
 * CanvasAtom.vue
 * 职责：策略编排区 UI 容器
 * 视觉：支持 1k/2k/4k 响应式布局，具备紫色/青色渐变背景光晕
 */
import { ref,watch } from 'vue'
import { Plus, Check } from 'lucide-vue-next'
import StrategyGroup from '@/components/StrategyGroup.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useStrategyEngine } from '@/composables/useStrategyEngine'
const isTitleError = ref(false); // 未输入标签名错误提示

// 1. 获取核心引擎
const {
  tagName,
  groups,
  addStrategyGroup,
  removeGroup,
  updateGroupTags
} = useStrategyEngine()

// 是否启用
const isActive = ref(true)

// 局部 UI 状态：删除弹窗控制
const showDeleteModal = ref(false)
const pendingDeleteId = ref<number | null>(null)

// 3. 定义对外事件
const emit = defineEmits(['save'])


// 开关切换函数
const toggleStatus = () => {
  isActive.value = !isActive.value
}

// --- 交互逻辑 ---
const openDeleteConfirm = (groupId: number) => {
  if (groups.value.length <= 1) return
  pendingDeleteId.value = groupId
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (pendingDeleteId.value !== null) {
    removeGroup(pendingDeleteId.value)
  }
  showDeleteModal.value = false
}

const triggerTitleError = () => {
  isTitleError.value = true;
  // 3秒后自动取消错误高亮
  setTimeout(() => {
    isTitleError.value = false;
  }, 1000);
}
// 对外暴露
defineExpose({ triggerTitleError });

// 监听输入
watch(tagName, (newVal) => {
  if (newVal.trim() !== '') {
    isTitleError.value = false;
  }
});
</script>

<template>
  <section class="canvas-area">

    <div class="canvas-top-bar">
      <input
        type="text"
        v-model="tagName"
        class="title-input"
        :class="{ 'input-error': isTitleError }"
        placeholder="请输入标签名称"
      />

      <div
        class="status-badge"
        :class="{ 'is-inactive': !isActive }"
        @click="toggleStatus"
      >
        <span class="dot"></span>
        STATUS: {{ isActive ? 'ACTIVE' : 'INACTIVE' }}
      </div>
    </div>

    <div class="canvas-scroll-container">
      <TransitionGroup name="canvas-list">
        <StrategyGroup
          v-for="group in groups"
          :key="group.id"
          :group-data="group"
          @remove-group="openDeleteConfirm(group.id)"
          @update-tags="(newTags) => updateGroupTags(group.id, newTags)"
        />
      </TransitionGroup>

      <div v-if="groups.length === 0" class="canvas-empty-guide">
        点击下方新增策略组开始构建逻辑
      </div>
    </div>

    <div class="canvas-footer">
      <button class="action-btn-unified" @click="addStrategyGroup">
        <Plus :size="16" class="btn-icon" />
        <span>新增策略组</span>
      </button>

      <button class="action-btn-unified" @click="emit('save')">
        <Check :size="16" class="btn-icon" />
        <span>保存当前标签</span>
      </button>
    </div>

    <ConfirmModal
      :show="showDeleteModal"
      title="确认删除策略组"
      message="确定要移除该策略组吗？此操作将清空组内所有条件。"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </section>
</template>

<style scoped>
/* ============================================================
   CANVAS ATOM - 中间画布区专属样式
   作用：管理策略编排区的布局、堆叠动效、背景光晕及底部操作
   ============================================================ */

/* --- 1. 画布主体架构 --- */
.canvas-area {
  position: relative;
  flex: 1; /* 自动占据中间剩余空间 */
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 600px; /* 保证在 1k 分辨率下不被挤压 */
}

/* 装饰：底层的紫色/青色渐变发光，增强科技感 */
.canvas-area::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 30%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 255, 170, 0.03) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
}

/* --- 2. 顶部工具栏 (名称输入与状态) --- */
.canvas-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.title-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  outline: none;
  width: 60%;
  transition: border-bottom 0.3s;
  border-bottom: 1px solid transparent;
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.2); /* 淡淡的半透明白，产生“虚位以待”的质感 */
  font-weight: 400;
  letter-spacing: 1px;
}

.title-input:focus {
  border-bottom-color: rgba(0, 255, 170, 0.3); /* 聚焦时底部的青色细线 */
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.status-badge {
  background: rgba(0, 255, 170, 0.05);
  border: 1px solid rgba(0, 255, 170, 0.2);
  color: var(--status-green);
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 10px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge .dot {
  width: 4px;
  height: 4px;
  background: var(--status-green);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--status-green);
}

/* --- 3. 核心滚动编排容器 --- */
.canvas-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 4px 150px; /* 底部预留大量空间，确保最后一个组能展开 */
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* 抽屉式堆叠核心逻辑 */
:deep(.strategy-layer) {
  margin-bottom: -140px; /* 向上挤压 140px，实现露出头部的堆叠感 */
  height: 190px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(10, 10, 10, 0.9) !important;
  backdrop-filter: blur(20px);
  position: relative;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.05),
    0 -10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 鼠标悬停时的“展开抽屉”效果 */
:deep(.strategy-layer:hover) {
  margin-bottom: 20px; /* 展开间距 */
  height: auto;
  min-height: 240px;
  transform: translateY(-8px); /* 向上浮动感 */
  z-index: 100 !important;
  border-color: rgba(0, 255, 170, 0.4) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  background: rgba(255, 255, 255, 0.05) !important;
}

/* 最后一个组默认展开 */
:deep(.strategy-layer:last-child) {
  margin-bottom: 0;
  height: auto;
  min-height: 200px;
}

/* --- 4. 底部悬浮操作区 --- */
.canvas-footer {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 100;
  padding: 10px 30px;
  background: radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
}

.action-btn-unified {
  position: relative;
  height: 44px;
  min-width: 160px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: var(--font-main);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.action-btn-unified:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.action-btn-unified:hover .btn-icon {
  transform: scale(1.1);
}

status-badge {
  /* 基础容器：增加点击手势与不可选中属性 */
  cursor: pointer;
  user-select: none;
  background: rgba(0, 255, 170, 0.03); /* 默认极淡的绿底 */
  border: 1px solid rgba(0, 255, 170, 0.15);
  color: rgba(0, 255, 170, 0.8); /* 👈 默认暗绿色文字 */
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 10px;
  font-family: var(--font-mono);
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 🟢 ACTIVE 状态下的呼吸点 */
.status-badge .dot {
  width: 5px;
  height: 5px;
  background: #00ffaa;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ffaa;
  transition: all 0.4s ease;
}

/* 🟡 INACTIVE 状态：变为暗黄色调 */
.status-badge.is-inactive {
  background: rgba(255, 191, 0, 0.03); /* 极淡的黄底 */
  border-color: rgba(255, 191, 0, 0.2);
  color: rgba(255, 191, 0, 0.7); /* 暗黄色文字 */
}

/* 🟡 INACTIVE 状态下的呼吸点变黄 */
.status-badge.is-inactive .dot {
  background: #ffbf00;
  box-shadow: 0 0 10px #ffbf00;
}

/* 悬停时的增强反馈 */
.status-badge:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.05);
}

/* --- 5. 画布列表动画 (TransitionGroup) --- */
.canvas-list-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.canvas-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.canvas-list-leave-active {
  transition: all 0.8s cubic-bezier(0.7, 0, 0.3, 1);
  position: absolute;
  width: 100%;
  z-index: 10;
}

.canvas-list-leave-to {
  opacity: 0;
  transform: translateY(-100px); /* 向上飘散效果 */
  filter: blur(10px);
}

.canvas-list-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.title-input.input-error {
  /* 警告状态：底部边框变红，并带有红色发光 */
  border-bottom: 1px solid rgba(255, 80, 80, 0.6) !important;
  text-shadow: 0 0 10px rgba(255, 80, 80, 0.3);
  animation: shake 0.4s ease-in-out; /* 增加一个轻微的抖动动画 */
}

/* 简单的抖动动画，增强视觉干扰 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* 修改 Placeholder 颜色，提醒更明显 */
.title-input.input-error::placeholder {
  color: rgba(255, 80, 80, 0.4);
}

/* --- 6. 其他引导样式 --- */
.canvas-empty-guide {
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  margin-top: 100px;
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

</style>
