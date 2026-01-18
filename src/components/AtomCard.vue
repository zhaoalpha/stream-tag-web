<script setup lang="ts">
// 定义组件接收的属性 (Props)
const props = defineProps<{
  name: string;
  label: string;
}>();

// 1. 定义拖拽开始的处理函数
const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    // 将卡片的数据转化为字符串，存入“拖拽口袋”中
    const data = JSON.stringify({ name: props.name, label: props.label })
    event.dataTransfer.setData('application/json', data)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="atom-card" draggable="true" @dragstart="handleDragStart">
    <div class="atom-name">{{ name }}</div>
    <div class="atom-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.atom-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none; /* 防止拖拽时选中文字 */
}

.atom-card:active {
  cursor: grabbing;
  opacity: 0.6;
}

.atom-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.atom-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 4px;
  text-align: center;
}

.atom-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}
</style>
