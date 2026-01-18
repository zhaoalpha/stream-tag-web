<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义组件接收的 props
// 我们接收整个标签对象，以及它的索引，方便后续操作
const props = defineProps<{
  tagData: {
    activeId: number
    name: string
    operator: string
    value: string
  }
  index: number // 标签在列表中的位置
}>()

// 定义组件触发的事件
const emit = defineEmits<{
  (e: 'remove', id: number): void // 通知父组件删除自己
  (e: 'update', index: number, field: 'operator' | 'value', newValue: string): void // 通知父组件更新数据
}>()

// 创建本地响应式变量，绑定到表单元素上
const localOperator = ref(props.tagData.operator)
const localValue = ref(props.tagData.value)

// 监听本地变量的变化，一旦用户修改，就向上汇报
watch(localOperator, (newVal) => {
  emit('update', props.index, 'operator', newVal)
})

watch(localValue, (newVal) => {
  emit('update', props.index, 'value', newVal)
})

// 可选的运算符列表
const operators = ['>', '>=', '=', '<=', '<']

// 1. 控制下拉菜单的状态
const isOpOpen = ref(false)

// 2. 切换菜单
const toggleDropdown = () => {
  isOpOpen.value = !isOpOpen.value
}

// 3. 选择操作符
const selectOp = (op: string) => {
  emit('update', props.index, 'operator', op)
  isOpOpen.value = false
}

// 4. 点击外部关闭（简单实现，也可以用自定义指令）
const closeDropdown = () => {
  isOpOpen.value = false
}

import { X } from 'lucide-vue-next'
</script>

<template>
  <div class="tag-row" :class="{ 'is-dropdown-active': isOpOpen }" @mouseleave="closeDropdown">
    <div class="tag-name">{{ tagData.name }}</div>

    <div class="custom-op-selector">
      <div class="op-trigger" :class="{ 'is-active': isOpOpen }" @click="toggleDropdown">
        <span class="current-op">{{ tagData.operator }}</span>
        <ChevronDown :size="12" class="op-chevron" :class="{ rotate: isOpOpen }" />
      </div>

      <Transition name="op-fade">
        <div v-if="isOpOpen" class="op-dropdown">
          <div
            v-for="op in operators"
            :key="op"
            class="op-item"
            :class="{ active: tagData.operator === op }"
            @click="selectOp(op)"
          >
            {{ op }}
          </div>
        </div>
      </Transition>
    </div>

    <div class="connector-line"></div>

    <input type="text" v-model="localValue" class="value-input" />

    <button class="remove-tag-btn" @click="emit('remove', tagData.activeId)">
      <X :size="14" />
    </button>
  </div>
</template>

<style scoped>
.tag-row {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 24px;
  gap: 16px;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  transition: all 0.3s;
}

.tag-row:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.tag-name {
  flex-shrink: 0;
  min-width: 100px;
}

/* 运算符选择器样式 */
.operator-selector {
  position: relative;
  width: 60px;
  flex-shrink: 0;
}

.operator-select {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 10px;
  color: #fff;
  font-family: inherit;
  appearance: none; /* 去掉浏览器默认下拉箭头 */
  cursor: pointer;
  outline: none;
}

.operator-selector .chevron {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  pointer-events: none; /* 让点击穿透到 select 上 */
  color: rgba(255, 255, 255, 0.5);
}

/* 连接线 */
.connector-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

/* 数值输入框样式 */
.value-input {
  width: 80px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 10px;
  color: #fff;
  font-family: inherit;
  text-align: right;
  outline: none;
}

.value-input:focus,
.operator-select:focus {
  border-color: var(--accent-color, #00ffaa);
}

.remove-tag-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}
.remove-tag-btn:hover {
  color: #ff4d4d;
  transform: scale(1.1);
}

/* 选择器容器 */
.custom-op-selector {
  position: relative;
  width: 64px;
  z-index: 10;
}

/* 触发器（当前选中的操作符） */
.op-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.op-trigger:hover,
.op-trigger.is-active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.current-op {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #fff;
}

/* 1. 提权：当下拉框打开时，确保这一行在最前面 */
.tag-row.is-dropdown-active {
  z-index: 1001;
  position: relative;
}

.op-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 64px;

  /* 1. 不透明度进一步提升至 0.94，接近实色但保留玻璃感 */
  background: rgba(15, 15, 15, 0.94);

  /* 2. 极致模糊：半径增加到 50px，彻底打碎背景轮廓 */
  backdrop-filter: blur(50px) saturate(120%);
  -webkit-backdrop-filter: blur(50px) saturate(120%);

  /* 3. 增加“白漆”涂层感：利用多重边框模拟玻璃厚度 */
  /* 第一层：昏暗翡翠绿外边框 */
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 6px;

  /* 4. 关键：内部叠加一层极淡的白光，模拟磨砂颗粒感 */
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.8),
    /* 外部深层投影 */ inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    /* 内部细微高光边缘 */ inset 0 0 15px rgba(255, 255, 255, 0.02); /* 内部整体泛白感 */

  z-index: 9999;
}

/* 选项样式微调，增强对比度 */
.op-item {
  padding: 10px 0;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  /* 文字完全不透明，确保极致清晰 */
  color: #ffffff;
  border-radius: 8px;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.op-item:hover {
  background: rgba(16, 185, 129, 0.25);
  color: #10b981;
}

.op-item.active {
  background: rgba(16, 185, 129, 0.35);
  color: #10b981;
  font-weight: bold;
}

/* 动画：微弱的淡入和位移 */
.op-fade-enter-active,
.op-fade-leave-active {
  transition: all 0.2s ease;
}
.op-fade-enter-from,
.op-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.tag-row {
  display: grid;
  /* 使用 grid 布局可以更精准地对齐：名称 | 操作符 | 连接线 | 数值 | 删除 */
  grid-template-columns: 120px 80px 1fr 100px 32px;
  gap: 12px;
  align-items: center;

  /* 增加内边距和微弱的背景 */
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;

  transition: all 0.3s ease;
}

.tag-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
