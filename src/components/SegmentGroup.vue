<script setup lang="ts">
import { ref } from 'vue'
import { Layers, X, Users } from 'lucide-vue-next'

// 1. 定义接收的属性：组数据
const props = defineProps<{
  groupData: {
    id: number
    logic: 'AND' | 'OR'
    tags: any[]
  }
}>()

// 2. 定义向外发出的事件
const emit = defineEmits(['toggle-logic', 'remove-tag', 'remove-group', 'drop-asset'])

// 3. 拖拽交互状态
const isDraggingOver = ref(false)

// 当人群拖到组件上方时
const handleDragOver = (e: DragEvent) => {
  e.preventDefault() // 【关键】必须阻止默认行为，否则无法触发 drop
  isDraggingOver.value = true
}

// 当人群离开组件上方时
const handleDragLeave = () => {
  isDraggingOver.value = false
}

// 当人群松开鼠标落在组件上时
const handleDrop = (e: DragEvent) => {
  isDraggingOver.value = false

  // 从拖拽载荷中提取数据
  const rawData = e.dataTransfer?.getData('assetData')
  if (rawData) {
    try {
      const asset = JSON.parse(rawData)
      // 【关键】通知父组件：有新人落在这个组里了
      emit('drop-asset', asset)
    } catch (err) {
      console.error('解析拖拽数据失败', err)
    }
  }
}
import { Trash2 } from 'lucide-vue-next'
</script>

<template>
  <div class="segment-group-card" :class="{ 'drop-active': isDraggingOver }" @dragover="handleDragOver"
       @dragleave="handleDragLeave" @drop="handleDrop">
    <div class="layer-header">
      <span class="layer-label">STRATEGY_GROUP_{{ groupData.id.toString().slice(-4) }}</span>
      <div class="layer-actions">
        <div class="layer-actions">
          <div class="logic-switch" @click="emit('toggle-logic', groupData.id)">
            <div class="switch-item" :class="{ active: groupData.logic === 'AND' }">AND</div>
            <div class="switch-item" :class="{ active: groupData.logic === 'OR' }">OR</div>
            <div class="switch-slider" :class="groupData.logic.toLowerCase()"></div>
          </div>
          <button class="delete-layer-btn" @click="emit('remove-group', groupData.id)" title="删除策略组">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>
    <!--
    <div class="group-header">
      <div class="logic-switch" @click="emit('toggle-logic', groupData.id)">
        <div class="switch-item" :class="{ active: groupData.logic === 'AND' }">AND</div>
        <div class="switch-item" :class="{ active: groupData.logic === 'OR' }">OR</div>
        <div class="switch-slider" :class="groupData.logic.toLowerCase()"></div>
      </div>
      <div class="header-actions">
        <X :size="14" class="group-close" @click="emit('remove-group', groupData.id)" />
      </div>
    </div> -->

    <div class="group-content">
      <TransitionGroup name="tag-pop">
        <div v-for="tag in groupData.tags" :key="tag.id" class="segment-pill">
          <Users :size="12" class="pill-icon" />
          <span class="pill-text">{{ tag.title }}</span>
          <X :size="12" class="pill-remove" @click="emit('remove-tag', groupData.id, tag.id)" />
        </div>
      </TransitionGroup>

      <div v-if="groupData.tags.length === 0" class="empty-hint">拖拽或点击左侧资产加入</div>
    </div>

    <div class="group-glow"></div>
  </div>
</template>

<style scoped>
.segment-group-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 0;
  margin-bottom: 24px;
  backdrop-filter: blur(12px);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

/* 拖拽悬停时的“磁吸”样式 */
.segment-group-card.drop-active {
  /* background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.01);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 255, 255, 0.05); */
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  z-index: 2;
  position: relative;
}

.logic-badge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 6px;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.3s;
}

.logic-badge:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
}

.group-close {
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: 0.3s;
}

.group-close:hover {
  color: #ff4d4d;
  transform: rotate(90deg);
}

.group-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 44px;
  z-index: 2;
  position: relative;
  padding: 10px;
}

/* 人群胶囊样式 */
.segment-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.segment-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.pill-remove {
  cursor: pointer;
  opacity: 0.3;
}

.pill-remove:hover {
  opacity: 1;
  color: #ff4d4d;
}

.empty-hint {
  width: 100%;
  text-align: center;
  padding: 12px;
  color: rgba(255, 255, 255, 0.15);
  font-size: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

/* 标签弹出动画 */
/* .tag-pop-enter-active {
  animation: tagScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.tag-pop-leave-active {
  animation: tagScaleIn 0.3s reverse ease-in;
}

@keyframes tagScaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
} */

.group-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.01) 0%, transparent 70%);
  pointer-events: none;
}

/* --- 1. 核心容器：悬浮舱体质感 --- */
.segment-group-card {
  position: relative;
  /* 极低的透明度，确保“不刺眼” */
  background: rgba(255, 255, 255, 0.015);
  /* 磨砂核心：模糊度调高，更有质感 */
  backdrop-filter: blur(20px) saturate(120%);
  /* 细微的冷银边框 */
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 0;
  /* 阴影要深，增加沉淀感 */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.segment-group-card:hover {
  /* 悬停时边框微亮即可 */
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

/* 悬停时的“激活”光晕 */
.segment-group-card:hover {
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-4px);
  box-shadow:
    0 35px 60px -15px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(255, 255, 255, 0.03);
}

/* --- 2. 头部：逻辑切换器的“冷银”化 --- */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.logic-badge {
  /* 延续实心白色的设计语言，但保持低调 */
  background: rgba(255, 255, 255, 0.9);
  color: #050505;
  /* 深色文字形成强对比 */
  padding: 4px 14px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.logic-badge:hover {
  background: #fff;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

/* --- 3. 人群胶囊：能量块质感 --- */
.segment-pill {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 18px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.segment-pill:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.pill-icon {
  color: rgba(255, 255, 255, 0.4);
}

/* --- 4. 辅助视觉细节 --- */
.empty-hint {
  width: 100%;
  padding: 30px;
  border: 1px dashed rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.15);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

/* 拖拽激活状态：增加蓝白色的幽灵光晕 */
.segment-group-card.drop-active {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
  box-shadow:
    0 0 40px rgba(255, 255, 255, 0.05),
    inset 0 0 20px rgba(255, 255, 255, 0.02);
}


/* --- 逻辑切换器：胶囊式设计 --- */
.logic-switch {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  width: 100px;
  /* 固定宽度保证整齐 */
}

.switch-item {
  flex: 1;
  text-align: center;
  padding: 4px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  z-index: 2;
  transition: color 0.3s;
}

.switch-item.active {
  color: #050505;
  /* 激活时文字变黑 */
}

/* 滑动的实心白块 */
.switch-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  z-index: 1;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 根据状态位移滑块 */
.switch-slider.and {
  transform: translateX(0);
}

.switch-slider.or {
  transform: translateX(100%);
}

/* 整体悬停效果 */
.logic-switch:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

/* yx --->新增 */
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

.layer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  /* 胶囊与删除按钮之间的间距 */
}

/* 1. 胶囊外壳：黑色跑道 */
.logic-capsule {
  position: relative;
  display: flex;
  width: 90px;
  /* 稍微缩小一点，更精致 */
  height: 32px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  cursor: pointer;
  padding: 3px;
  /* 这里是滑块与边框的间距 */
  user-select: none;
  overflow: hidden;
  box-sizing: border-box;
  /* 强制包含边框和内边距 */
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
  font-size: 10px;
  /* 字体调小一点更有科技感 */
  font-weight: 800;
  color: rgba(255, 255, 255, 0.3);
  /* 未激活时更暗一些 */
  transition: color 0.3s;
}

.capsule-label.active {
  color: #000000;
  /* 激活时在白色滑块上显示纯黑 */
}

/* 专业的图标按钮样式 */
.delete-layer-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  /* 极淡的底色 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  /* 圆形按钮 */
  color: rgba(255, 255, 255, 0.3);
  /* 默认暗色 */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

/* 悬停时的视觉反馈 */
.delete-layer-btn:hover {
  background: rgba(255, 77, 77, 0.15);
  /* 淡淡的红色背景 */
  border-color: rgba(255, 77, 77, 0.4);
  color: #ff4d4d;
  /* 图标变红 */
  transform: scale(1.1);
  /* 轻微放大 */
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.2);
}

.delete-layer-btn:active {
  transform: scale(0.95);
  /* 点击时的压感反馈 */
}
</style>
