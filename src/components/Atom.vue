<script setup lang="ts">
/**
 * ATOM.vue - 资产库组件
 * 职责：负责原材料（原子标签）的展示、搜索与数据源切换
 */
import { ref } from 'vue'
import { Search, ChevronDown } from 'lucide-vue-next'
import AtomCard from '@/components/AtomCard.vue'
import { useAtomLibrary } from '@/composables/useAtomLibrary' // 引入之前定义的资产库逻辑

// 从逻辑层解构状态与方法
const {
  currentTable,
  searchQuery,
  isTableMenuOpen,
  isSearchActive,
  tableData,
  filteredAtoms,
  selectTable,
} = useAtomLibrary()

const searchInput = ref<HTMLInputElement | null>(null)

/**
 * 切换搜索状态并自动聚焦
 */
const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value
  if (isSearchActive.value) {
    // 延迟 200ms 等待展开动画执行一半时聚焦，体验更丝滑
    setTimeout(() => searchInput.value?.focus(), 200)
  }
}

/**
 * 失焦处理：如果没有输入内容，则自动收起搜索框
 */
const handleSearchBlur = () => {
  if (!searchQuery.value) {
    isSearchActive.value = false
  }
}
</script>

<template>
  <aside class="side-panel left-panel">
    <div class="panel-header">
      <div class="table-selector" :class="{ 'is-hidden': isSearchActive }">
        <div class="selector-trigger" @click="isTableMenuOpen = !isTableMenuOpen">
          <span class="panel-label">{{ currentTable.toUpperCase() }}</span>
          <ChevronDown :size="12" class="trigger-icon" :class="{ rotate: isTableMenuOpen }" />
        </div>

        <Transition name="menu-fade">
          <div v-if="isTableMenuOpen" class="table-dropdown" @mouseleave="isTableMenuOpen = false">
            <div
              v-for="(_, tableName) in tableData"
              :key="tableName"
              class="table-item"
              :class="{ active: currentTable === tableName }"
              @click="selectTable(tableName as string)"
            >
              {{ tableName.toUpperCase() }}
            </div>
          </div>
        </Transition>
      </div>

      <div class="search-wrapper" :class="{ 'is-active': isSearchActive }">
        <Search class="search-trigger-icon" :size="18" @click="toggleSearch" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="FILTER ATOMS..."
          class="search-input"
          @blur="handleSearchBlur"
        />
      </div>
    </div>

    <div class="panel-scroll">
      <TransitionGroup name="atom-list">
        <AtomCard
          v-for="atom in filteredAtoms"
          :key="atom.id"
          :name="atom.name"
          :label="atom.label"
        />
      </TransitionGroup>

      <div v-if="filteredAtoms.length === 0" class="no-results">
        {{ searchQuery ? 'NO ATOMS MATCHED' : 'LIBRARY IS EMPTY' }}
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* --- 1. 基础布局 --- */
.left-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;

  /* --- 核心修复：全包围白月光边框 --- */
  background: rgba(255, 255, 255, 0.02); /* 磨砂玻璃底色 */
  border: 1px solid rgba(255, 255, 255, 0.08) !important; /* 四面完整的边框 */
  border-radius: 24px; /* 标志性的大圆角，包裹住头部和列表 */

  /* 增加磨砂玻璃感，让背景的光晕透出来 */
  backdrop-filter: blur(20px);

  /* 确保内部内容（如滚动条）不会超出这个圆角边框 */
  overflow: hidden;

  /* 增加一点阴影，让它像是在 1k/2k/4k 屏幕上浮起来的 */
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

/* 调整滚动区的内边距，配合大圆角效果 */
.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 20px; /* 顶部留一点间距，不让卡片紧贴边框 */
}

.panel-header {
  height: 60px; /* 固定头部高度 */
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* 核心：为搜索框提供定位基准 */
  box-sizing: border-box;
}

/* --- 2. 表名切换逻辑 --- */
.table-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 1;
  transform: translateX(0);
}

.table-selector.is-hidden {
  opacity: 0;
  transform: translateX(-20px);
  pointer-events: none;
}

.selector-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.panel-label {
  font-family: var(--font-mono); /* 继承全局字体 */
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.trigger-icon.rotate {
  transform: rotate(180deg);
  transition: 0.3s;
}

/* 下拉框样式 */
.table-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 16px;
  width: 180px;
  background: rgba(15, 15, 15, 0.98);
  backdrop-filter: blur(40px);
  border: 1px solid var(--aether-border);
  border-radius: 12px;
  padding: 6px;
  z-index: 100;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.table-item {
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  cursor: pointer;
}

.table-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 2px 0 0 #fff; /* 侧边高亮条 */
}

/* --- 3. 搜索框核心动效 (Apple 风格) --- */
.search-wrapper {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  height: 34px;
  width: 34px; /* 初始圆圈状态 */
  border-radius: 100px;
  transition:
    width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.4s ease;
  z-index: 50;
  cursor: pointer;
}

.search-wrapper.is-active {
  width: calc(100% - 100px); /* 展开铺满头部 */
  background: rgba(15, 15, 15, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.search-trigger-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.4s ease;
}

.search-trigger-icon:hover {
  color: #00ffaa; /* 悬停时变青色，增加互动感 */
  transform: scale(1.1);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
  opacity: 0;
  margin-left: 0;
  transition: opacity 0.3s ease 0.2s; /* 延迟文字出现 */
}

.search-wrapper.is-active {
  /**
   * 左右边距均为 16px，确保与下方卡片垂直对齐
   * 设置 width 为 auto，让浏览器根据左右定位自动计算精确宽度
   */
  left: 16px;
  right: 16px;
  width: auto;

  /* 磨砂质感与白月光边框 */
  background: rgba(15, 15, 15, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0 12px;

  /* 只在容器内部产生深度感，不溢出外边框 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.search-wrapper.is-active .search-input {
  opacity: 1 !important;
  margin-left: 10px;
}

/* --- 4. 资产卡片穿透样式 --- */
.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 20px;
}

/* 白月光边框质感 */
:deep(.atom-card) {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 10px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

:deep(.atom-card:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  transform: translateX(4px); /* 悬停微移感 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* --- 5. 动画效果 --- */
.atom-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.atom-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.atom-list-enter-active,
.atom-list-leave-active,
.atom-list-move {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.atom-list-leave-active {
  position: absolute;
  width: calc(100% - 32px);
}

.no-results {
  text-align: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 60px;
  letter-spacing: 2px;
}
</style>
