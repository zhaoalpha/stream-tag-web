<script setup lang="ts">
/**
 * ArchiveAtom.vue - 存档列表组件
 * 职责：展示已保存的策略，支持搜索过滤和点击回填
 */
import { ref } from 'vue'
import { Search, X, Layers, Users } from 'lucide-vue-next'
import { useArchives } from '@/composables/useArchives' // 引入共享的存档逻辑

// 从逻辑层解构状态与方法
const { filteredArchives, isArchiveSearchActive, archiveSearchQuery, toggleArchiveSearch } =
  useArchives()

const searchInput = ref<HTMLInputElement | null>(null)

/**
 * 切换搜索并自动聚焦
 */
const handleToggleSearch = () => {
  toggleArchiveSearch()
  if (isArchiveSearchActive.value) {
    setTimeout(() => searchInput.value?.focus(), 200)
  }
}

/**
 * 失焦收起逻辑
 */
const handleBlur = () => {
  if (!archiveSearchQuery.value) {
    isArchiveSearchActive.value = false
  }
}
// 点击恢复archive的卡片
defineEmits(['load', 'request-delete'])
</script>

<template>
  <aside class="side-panel right-panel">
    <div class="panel-header">
      <div class="header-label" :class="{ 'is-hidden': isArchiveSearchActive }">
        <Layers :size="14" class="label-icon" />
        <span class="label-text">标签库</span>
      </div>

      <div class="search-wrapper" :class="{ 'is-active': isArchiveSearchActive }">
        <Search class="search-trigger-icon" :size="18" @click="handleToggleSearch" />
        <input
          ref="searchInput"
          v-model="archiveSearchQuery"
          type="text"
          placeholder="搜索标签..."
          class="search-input"
          @blur="handleBlur"
        />
      </div>
    </div>

    <div class="panel-scroll">
      <TransitionGroup name="archive-list">
        <div
          v-for="item in filteredArchives"
          :key="item.id"
          class="archive-card"
          @click="$emit('load', item)"
          :class="{ 'is-active': item.status === 'active' }"
        >
          <div class="card-main">
            <div class="card-title">{{ item.title }}</div>
            <div class="card-meta">
              <span class="table-tag">{{ item.tableName }}</span>
              <span class="time-stamp">{{ item.time }}</span>
              <div class="status-indicator" :class="item.status">
                <span class="status-text">{{ item.status === 'active' ? '启用' : '暂停' }}</span>
                <span class="status-dot"></span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="audience-count">
              <span class="count-num">{{ item.totalCount }}</span>
              <Users :size="12" class="count-icon" />
            </div>
            <div class="flow-line" :class="item.status"></div>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="filteredArchives?.length === 0" class="no-results">
        {{ archiveSearchQuery ? 'NO MATCHES' : 'EMPTY ARCHIVES' }}
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* --- 1. 核心容器：白月光边框对齐 --- */
.right-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;

  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08) !important; /* 👈 标志性的白月光边框 */
  border-radius: 24px; /* 👈 标志性的大圆角 */
  backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.panel-header {
  height: 60px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}

/* --- 2. 头部标签动画 --- */
.header-label {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  color: rgba(255, 255, 255, 0.5);
}

.header-label.is-hidden {
  opacity: 0;
  transform: translateX(-20px);
}

.label-text {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* --- 3. 搜索框核心对齐 --- */
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
  justify-content: flex-start;
  left: 16px;
  right: 16px;
  width: auto;
  background: rgba(15, 15, 15, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0 12px;
}

.search-trigger-icon {
  color: rgba(255, 255, 255, 0.7); /* 👈 给图标一个明亮的白月光色 */
  flex-shrink: 0; /* 防止图标被输入框挤扁 */
  transition: all 0.3s ease;
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
  transition: opacity 0.3s ease 0.2s;
}

.search-wrapper.is-active .search-input {
  opacity: 1;
  margin-left: 10px;
}

/* --- 4. 存档卡片样式 --- */
.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 20px;
}

.archive-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.archive-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 6px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-family: var(--font-mono);
  color: rgba(255, 255, 255, 0.3);
}

.table-tag {
  color: rgba(255, 255, 255, 0.3);
}

.card-footer {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audience-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.count-num {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  font-family: var(--font-mono);
}

.count-unit {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 1px;
}

/* 流光装饰线 */
.flow-line {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 170, 0.4), transparent);
  animation: flow 3s infinite;
}

/* Inactive (琥珀黄) - 代表“已挂起/草稿” */
.flow-line.inactive {
  background: linear-gradient(90deg,
  transparent,
  rgba(255, 191, 0, 0.8), /* #ffbf00 琥珀色 */
  transparent
  );
  filter: drop-shadow(0 0 4px rgba(255, 191, 0, 0.4));
}

@keyframes flow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* --- 5. 动画效果 --- */
.archive-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.archive-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.archive-list-enter-active,
.archive-list-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.archive-list-leave-active {
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

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 🟢 启用状态：青色 */
.status-indicator.active {
  color: #00ffaa;
  text-shadow: 0 0 8px rgba(0, 255, 170, 0.4);
}

/* 🟡 暂停状态：琥珀黄 */
.status-indicator.inactive {
  color: #ffbf00;
  text-shadow: 0 0 8px rgba(255, 191, 0, 0.4);
}

/* 状态小圆点（呼吸灯效果） */
.status-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor; /* 自动继承文字颜色 */
  box-shadow: 0 0 6px currentColor;
}

/* 激活状态的圆点呼吸动画 */
.status-indicator.active .status-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
