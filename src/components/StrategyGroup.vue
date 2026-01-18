<script setup lang="ts">
import { ref } from 'vue'
import TagRow from './TagRow.vue'

const props = defineProps<{
  groupData: any
}>()

// 注意：这里需要增加 'update-logic' 声明
const emit = defineEmits(['remove-group', 'update-tags', 'update-logic'])

const isOver = ref(false)

// 处理拖拽落入该 Layer
const onDropInGroup = (e: DragEvent) => {
  e.preventDefault()
  isOver.value = false

  const dataStr = e.dataTransfer?.getData('application/json')
  if (dataStr) {
    const atomData = JSON.parse(dataStr)
    const newTag = {
      ...atomData,
      activeId: Date.now() + Math.random(),
      operator: '>',
      value: '0',
    }

    const updatedTags = [...props.groupData.tags, newTag]
    emit('update-tags', updatedTags)
  }
}

// 【关键修改点】：将 toggleLogic 移出 onDropInGroup，成为独立函数
const toggleLogic = () => {
  const newLogic = props.groupData.logic === 'AND' ? 'OR' : 'AND'
  // 修改本地数据（Vue3 响应式会自动同步）
  props.groupData.logic = newLogic
  emit('update-logic', newLogic)
}

import { Trash2 } from 'lucide-vue-next'
</script>

<template>
  <div
    class="strategy-layer"
    :class="{ 'is-over': isOver }"
    @dragover.prevent="isOver = true"
    @dragleave="isOver = false"
    @drop.prevent="onDropInGroup"
  >
    <div class="layer-header">
      <span class="layer-label">STRATEGY_GROUP_{{ groupData.id.toString().slice(-4) }}</span>
      <div class="layer-actions">
        <div class="layer-actions">
          <div class="logic-capsule" @click="toggleLogic">
            <div class="capsule-slider" :class="{ 'is-or': groupData.logic === 'OR' }"></div>
            <span class="capsule-label" :class="{ active: groupData.logic === 'AND' }">AND</span>
            <span class="capsule-label" :class="{ active: groupData.logic === 'OR' }">OR</span>
          </div>

          <button class="delete-layer-btn" @click="$emit('remove-group')" title="删除策略组">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div class="layer-content">
      <div v-if="groupData.tags.length === 0" class="empty-hint">DROP ATOMS HERE</div>
      <div v-else class="tag-list">
        <TransitionGroup name="list-slide">
          <TagRow
            v-for="(tag, index) in groupData.tags"
            :key="tag.activeId"
            :tag-data="tag"
            :index="index"
            @remove="(id) => (groupData.tags = groupData.tags.filter((t) => t.activeId !== id))"
            @update="(idx, field, val) => (groupData.tags[idx][field] = val)"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strategy-layer {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.strategy-layer.is-over {
  border-color: rgba(0, 40, 0, 0.3); /* 极暗绿边框，带透明 */
  background: rgba(0, 30, 0, 0.015); /* 几乎看不见的微绿背景 */
}

.layer-header {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.layer-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}

.logic-toggle {
  display: flex;
  background: #000;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.logic-toggle button {
  background: transparent;
  border: none;
  color: #555;
  font-size: 10px;
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 4px;
}

.logic-toggle button.active {
  background: #fff;
  color: #000;
}

.layer-content {
  padding: 20px;
  min-height: 80px;
}

.empty-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.1);
  font-size: 12px;
  letter-spacing: 2px;
  padding: 20px;
}

.delete-layer {
  background: none;
  border: none;
  color: #444;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
}

.delete-layer:hover {
  color: #ff4d4d;
}

/* 1. 胶囊外壳：黑色跑道 */
.logic-capsule {
  position: relative;
  display: flex;
  width: 90px; /* 稍微缩小一点，更精致 */
  height: 32px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  cursor: pointer;
  padding: 3px; /* 这里是滑块与边框的间距 */
  user-select: none;
  overflow: hidden;
  box-sizing: border-box; /* 强制包含边框和内边距 */
  margin-right: 12px;
}

/* 2. 白色滑块：负责平移运动 */
.capsule-slider {
  position: absolute;
  /* 计算高度：容器高度(32) - 容器padding(3*2) - 容器边框(1*2) = 24px */
  top: 3px;
  left: 3px;
  /* 计算宽度：(容器宽度90 - padding 6 - 边框 2) / 2 = 41px */
  width: 41px;
  height: 24px;
  background: #ffffff;
  border-radius: 100px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 3. 切换到 OR 时的平移距离 */
/* 平移距离刚好是滑块自身的宽度：41px */
.capsule-slider.is-or {
  transform: translateX(41px);
}

/* 4. 文字标签层 */
.capsule-label {
  flex: 1;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; /* 字体调小一点更有科技感 */
  font-weight: 800;
  color: rgba(255, 255, 255, 0.3); /* 未激活时更暗一些 */
  transition: color 0.3s;
}

.capsule-label.active {
  color: #000000; /* 激活时在白色滑块上显示纯黑 */
}

/* 确保头部动作区域横向排列并对齐 */
.layer-actions {
  display: flex;
  align-items: center;
  gap: 8px; /* 胶囊与删除按钮之间的间距 */
}

/* 专业的图标按钮样式 */
.delete-layer-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03); /* 极淡的底色 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%; /* 圆形按钮 */
  color: rgba(255, 255, 255, 0.3); /* 默认暗色 */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

/* 悬停时的视觉反馈 */
.delete-layer-btn:hover {
  background: rgba(255, 77, 77, 0.15); /* 淡淡的红色背景 */
  border-color: rgba(255, 77, 77, 0.4);
  color: #ff4d4d; /* 图标变红 */
  transform: scale(1.1); /* 轻微放大 */
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.2);
}

.delete-layer-btn:active {
  transform: scale(0.95); /* 点击时的压感反馈 */
}

.tag-list {
  display: flex;
  flex-direction: column; /* 让条件行垂直排列 */
  gap: 12px; /* 关键：在每一行之间增加 12px 的间距 */
  width: 100%;
}

.strategy-layer:has(.is-dropdown-active) {
  overflow: visible !important;
  z-index: 1000 !important;
}

.list-slide-enter-active,
.list-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px); /* 从左侧稍微滑入 */
}

.list-slide-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
