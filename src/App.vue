<script setup lang="ts">
import { computed, ref } from 'vue'
// 导入我们拆分出去的子组件
import AtomCard from './components/AtomCard.vue'
import StrategyGroup from './components/StrategyGroup.vue'
import { nextTick } from 'vue'
import MainHeader from './components/MainHeader.vue'

const currentActiveTab = ref('tag') // 控制当前激活的导航
const handleTabChange = (tabId: string) => {
  currentActiveTab.value = tabId
  console.log('切换到了页面:', tabId)
}

/**
 * 1. 类型定义 (TypeScript)
 * 定义原子（Atom）和策略组（Group）的结构，保证数据流清晰
 */
interface Atom {
  id: number
  name: string
  label: string
}

interface ActiveTag extends Atom {
  activeId: number // 在画布中的唯一标识
  operator: string // 运算符，如 >, <, =
  value: string // 填写的数值
}

interface Group {
  id: number
  logic: 'AND' | 'OR'
  tags: ActiveTag[]
}

/**
 * 2. 响应式状态声明
 */
// 标题名称，支持双向绑定
const tagName = ref('请输入标签名称')

// 定义表名类型
type TableName = 'user_profile' | 'order_info' | 'device_data'

// 模拟多表数据源
const tableData: Record<TableName, Atom[]> = {
  user_profile: [
    { id: 1, name: 'user_age', label: '用户年龄' },
    { id: 2, name: 'gender', label: '用户性别' },
    { id: 3, name: 'city_level', label: '城市等级' },
  ],
  order_info: [
    { id: 101, name: 'pay_amt', label: '累计消费金额' },
    { id: 102, name: 'order_count', label: '订单总数' },
    { id: 103, name: 'avg_price', label: '平均客单价' },
  ],
  device_data: [
    { id: 201, name: 'os_type', label: '操作系统' },
    { id: 202, name: 'is_root', label: '是否越狱' },
  ],
}

// 状态追踪
const currentTable = ref<TableName>('user_profile') // 当前选中的表
const isTableMenuOpen = ref(false) // 控制下拉菜单

// 计算属性：当前表对应的原子列表
const currentAtoms = computed(() => tableData[currentTable.value])

// 修改之前的过滤逻辑：改为过滤当前选中的表
const filteredAtoms = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return currentAtoms.value
  return currentAtoms.value.filter(
    (atom) => atom.name.toLowerCase().includes(query) || atom.label.toLowerCase().includes(query),
  )
})

// 存储中间区域所有的策略组 (Layers) 默认带一个
const groups = ref<Group[]>([
  {
    id: Date.now(), // 初始组的 ID
    logic: 'AND',
    tags: [],
  },
])

// 3. 新增策略组函数
const addStrategyGroup = () => {
  console.log('点击了新增按钮') // 调试用：看控制台有没有打印
  groups.value.push({
    id: Date.now() + Math.random(), // 确保 ID 绝对唯一
    logic: 'AND',
    tags: [],
  })
}

const selectTable = (name: string) => {
  currentTable.value = name as TableName // 这里是标准的 TS 环境，支持 as 断言
  isTableMenuOpen.value = false
}

/**
 * 3. 业务逻辑函数
 */

// 修改点 2：删除策略组时增加确认提示
const removeGroup = (groupId: number) => {
  // 检查是否是最后一个组（可选：如果你想保留至少一个组，可以加这个判断）
  // if (groups.value.length <= 1) {
  //   alert('请至少保留一个策略组')
  //   return
  // }

  // 专业的做法是弹窗确认
  const confirmed = window.confirm('确定要删除这个策略组吗？组内的所有原子配置都将丢失。')

  if (confirmed) {
    groups.value = groups.value.filter((g) => g.id !== groupId)
  }
}

const archiveScrollRef = ref<HTMLElement | null>(null)

// 处理子组件（StrategyGroup）传回来的标签更新
const handleUpdateTags = (groupId: number, newTags: ActiveTag[]) => {
  const targetGroup = groups.value.find((g) => g.id === groupId)
  if (targetGroup) {
    targetGroup.tags = newTags
  }
}

import ConfirmModal from './components/ConfirmModal.vue'
import { Search, ChevronDown } from 'lucide-vue-next'

// 定义弹窗控制状态
const showDeleteModal = ref(false)
const pendingDeleteId = ref<number | null>(null)

// 修改删除函数：先打开弹窗，暂存 ID
const openDeleteConfirm = (groupId: number) => {
  pendingDeleteId.value = groupId
  showDeleteModal.value = true
}

// 弹窗确认后的逻辑
const confirmDelete = () => {
  if (pendingDeleteId.value !== null) {
    groups.value = groups.value.filter((g) => g.id !== pendingDeleteId.value)
  }
  closeModal()
}

const closeModal = () => {
  showDeleteModal.value = false
  pendingDeleteId.value = null
}

const isSearchActive = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value
  if (isSearchActive.value) {
    // 自动聚焦
    setTimeout(() => searchInput.value?.focus(), 200)
  }
}

const handleSearchBlur = () => {
  if (!searchQuery.value) isSearchActive.value = false
}

// 1. 定义存档卡片的接口
interface ArchiveRecord {
  id: string
  title: string // 存档名称
  tableName: string // 所属表名（例如: USER_PROFILE）
  groupCount: number // 包含多少个策略组
  tagCount: number // 总共有多少个标签/条件
  createdAt: string // 格式化后的时间
  logicData: any[] // 核心数据：保存当时的 strategyGroups
}

// 1. Toast 状态
const showToast = ref(false)
const toastMessage = ref('')

// 2. 触发 Toast 的通用函数
const triggerToast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true

  // 2.5秒后自动关闭
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

// 2. 创建存档列表的状态
const archives = ref<ArchiveRecord[]>([])

const handleSaveStrategy = () => {
  if (groups.value.length === 0 || groups.value[0].tags.length === 0) {
    alert('当前工作台为空，无法保存')
    return
  }

  // 1. 执行现有的保存逻辑 (创建 newArchive 并推入 archives 数组)
  const totalTags = groups.value.reduce((sum, group) => sum + group.tags.length, 0)
  const newArchive: ArchiveRecord = {
    id: Date.now().toString(),
    title: `STRATEGY_${archives.value.length + 1}`,
    tableName: currentTable.value.toUpperCase(),
    groupCount: groups.value.length,
    tagCount: totalTags,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    logicData: JSON.parse(JSON.stringify(groups.value)),
  }
  archives.value.unshift(newArchive)
  triggerToast('STRATEGY SAVED SUCCESSFULLY')

  nextTick(() => {
    if (archiveScrollRef.value) {
      archiveScrollRef.value.scrollTo({
        top: 0,
        behavior: 'smooth', // 丝滑滚动
      })
    }
  })

  // 2. 触发动画：先清空，让旧卡片“飘走”
  groups.value = []

  // 3. 延迟一瞬间，再放入新的默认 AND 组，让它“弹入”
  setTimeout(() => {
    groups.value = [
      {
        id: Date.now(),
        logic: 'AND',
        tags: [],
      },
    ]
  }, 100) // 100ms 的错峰，让视觉更灵动
}

// 3. 【新增】点击右侧存档，还原数据到中间
const loadArchive = (record: ArchiveRecord) => {
  groups.value = JSON.parse(JSON.stringify(record.logicData))
  currentTable.value = record.tableName.toLowerCase() as TableName
}

// 查询右侧归档的标签
// 1. 右侧搜索相关的响应式状态
const isArchiveSearchActive = ref(false)
const archiveSearchQuery = ref('')
const archiveSearchInput = ref<HTMLInputElement | null>(null)

// 2. 切换搜索状态的函数
const toggleArchiveSearch = () => {
  isArchiveSearchActive.value = !isArchiveSearchActive.value
  if (isArchiveSearchActive.value) {
    // 自动聚焦，给一点点延迟确保框体已展开
    setTimeout(() => archiveSearchInput.value?.focus(), 200)
  }
}

// 3. 【关键逻辑】：计算属性过滤存档列表
const filteredArchives = computed(() => {
  const query = archiveSearchQuery.value.toLowerCase().trim()
  if (!query) return archives.value

  return archives.value.filter(
    (record) =>
      record.title.toLowerCase().includes(query) || record.tableName.toLowerCase().includes(query),
  )
})

const handleArchiveSearchBlur = () => {
  if (!archiveSearchQuery.value) {
    isArchiveSearchActive.value = false
  }
}
</script>

<template>
  <div class="aether-container">
    <Transition name="toast-fade">
      <div v-if="showToast" class="toast-wrapper">
        <div class="toast-content">
          <div class="toast-icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="toast-text">{{ toastMessage }}</span>
        </div>
        <div class="toast-progress"></div>
      </div>
    </Transition>

    <MainHeader :active-id="currentActiveTab" @change="handleTabChange" />

    <main class="main-content">
      <aside class="side-panel left-panel">
        <div class="panel-header">
          <div class="table-selector" :class="{ 'is-hidden': isSearchActive }">
            <div class="selector-trigger" @click="isTableMenuOpen = !isTableMenuOpen">
              <span class="panel-label">{{ currentTable.toUpperCase() }}</span>
              <ChevronDown :size="12" :class="{ rotate: isTableMenuOpen }" />
            </div>

            <Transition name="menu-fade">
              <div
                v-if="isTableMenuOpen"
                class="table-dropdown"
                @mouseleave="isTableMenuOpen = false"
              >
                <div
                  v-for="(atoms, tableName) in tableData"
                  :key="tableName"
                  class="table-item"
                  :class="{ active: currentTable === tableName }"
                  @click="selectTable(tableName)"
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

          <div v-if="filteredAtoms.length === 0" class="no-results">NO ATOMS MATCHED</div>
        </div>
      </aside>

      <section class="canvas-area">
        <div class="canvas-top-bar">
          <input type="text" v-model="tagName" class="title-input" />
          <div class="status-badge">
            <span class="dot"></span>
            STATUS: ACTIVE
          </div>
        </div>

        <ConfirmModal
          :show="showDeleteModal"
          title="确认删除策略组？"
          message="此操作将永久删除该组及其包含的所有原子配置，无法撤回。"
          @confirm="confirmDelete"
          @cancel="closeModal"
        />

        <div class="canvas-scroll-container">
          <TransitionGroup name="canvas-list">
            <StrategyGroup
              v-for="group in groups"
              :key="group.id"
              :group-data="group"
              @remove-group="openDeleteConfirm(group.id)"
              @update-tags="(newTags) => handleUpdateTags(group.id, newTags)"
            />
          </TransitionGroup>

          <div v-if="groups.length === 0" class="canvas-empty-guide">
            点击下方 “新增策略组” 开始构建逻辑
          </div>
        </div>

        <div class="canvas-footer">
          <button class="action-btn-unified" @click="addStrategyGroup">
            <Plus :size="16" class="btn-icon" />
            <span>新增策略组</span>
            <div class="btn-light-track"></div>
          </button>

          <button class="action-btn-unified" @click="handleSaveStrategy">
            <Check :size="16" class="btn-icon" />
            <span>保存当前标签</span>
            <div class="btn-light-track"></div>
          </button>
        </div>
      </section>

      <aside class="side-panel right-panel">
        <div class="panel-header">
          <div class="header-label-group" :class="{ 'is-hidden': isArchiveSearchActive }">
            <span class="panel-label">ARCHIVES</span>
            <span class="archive-count">{{ archives.length }}</span>
          </div>

          <div class="search-wrapper" :class="{ 'is-active': isArchiveSearchActive }">
            <Search class="search-trigger-icon" :size="18" @click="toggleArchiveSearch" />
            <input
              ref="archiveSearchInput"
              v-model="archiveSearchQuery"
              type="text"
              placeholder="FIND ARCHIVES..."
              class="search-input"
              @blur="handleArchiveSearchBlur"
            />
          </div>
        </div>

        <div class="panel-scroll" ref="archiveScrollRef">
          <TransitionGroup name="archive-list" tag="div" class="archive-list-wrapper">
            <div
              v-for="record in filteredArchives"
              :key="record.id"
              class="archive-card"
              @click="loadArchive(record)"
            >
              <div class="archive-card-header">
                <span class="archive-title">{{ record.title }}</span>
                <span class="archive-time">{{ record.createdAt }}</span>
              </div>

              <div class="archive-card-body">
                <div class="meta-item">
                  <span class="meta-label">SOURCE:</span>
                  <span class="meta-value">{{ record.tableName }}</span>
                </div>
                <div class="meta-row">
                  <span>{{ record.groupCount }} GROUPS</span>
                  <span class="divider">/</span>
                  <span>{{ record.tagCount }} TAGS</span>
                </div>
              </div>

              <div class="shimmer-effect"></div>
            </div>
          </TransitionGroup>

          <div v-if="filteredArchives.length === 0" class="no-results">
            {{ archiveSearchQuery ? 'MATCH NOT FOUND' : 'NO SAVED STRATEGIES' }}
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
/* 容器布局 */
.aether-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #050505;
}

/* 顶部导航 */
.main-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-main {
  font-weight: 700;
  letter-spacing: 2px;
  font-size: 14px;
}
.logo-sub {
  color: #666;
  font-size: 10px;
  margin-left: 8px;
  border: 1px solid #333;
  padding: 1px 4px;
  border-radius: 4px;
}

.nav-capsule {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-item {
  padding: 6px 18px;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  border-radius: 100px;
  transition: 0.3s;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

/* 主体内容 */
.main-content {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
  overflow: hidden;
}

/* 通用面板样式 */
.side-panel {
  width: 320px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px 16px; /* 稍微缩小内边距 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.panel-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 让滚动条更漂亮（窄一点，暗一点） */
.panel-scroll::-webkit-scrollbar {
  width: 4px;
}
.panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

/* 中间画布 */
.canvas-area {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.canvas-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 28px;
  outline: none;
  width: 60%;
}

.status-badge {
  background: rgba(0, 255, 170, 0.05);
  border: 1px solid rgba(0, 255, 170, 0.2);
  color: #00ffaa;
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
  background: #00ffaa;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ffaa;
}

.action-btn {
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: 0.3s;
}

.action-btn.ghost {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.action-btn.primary {
  background: #fff;
  border: none;
  color: #000;
  font-weight: 600;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

/* 简单的入场动画 */
@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.canvas-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 4px 150px; /* 底部留多一点空间给展开效果 */
  display: flex;
  flex-direction: column;
}

/* 关键：为 StrategyGroup 组件添加堆叠样式 */
:deep(.strategy-layer) {
  margin-bottom: -140px; /* 默认向上挤压，只露出头部 */
  height: 190px;
  overflow: hidden; /* 隐藏掉下面的条件 */
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(10, 10, 10, 0.9) !important;
  backdrop-filter: blur(20px);
  position: relative;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
}

/* 最后一个组（Root）默认永远展开 */
:deep(.strategy-layer:last-child) {
  margin-bottom: 0;
  height: auto;
  min-height: 200px;
}

/* 鼠标悬停时的“抽屉”展开效果 */
:deep(.strategy-layer:hover) {
  margin-bottom: 20px;
  height: auto;
  min-height: 240px;
  transform: translateY(-8px); /* 悬停时往上弹一点 */
  z-index: 100 !important;
  border-color: rgba(0, 255, 170, 0.3) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
}

/* 针对 StrategyGroup 内部或外部容器的修改 */
:deep(.strategy-layer) {
  /* ...原有样式... */
  background: rgba(20, 20, 20, 0.4) !important; /* 调整为带有灰度的透明 */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* 添加微弱的顶部内发光，模拟玻璃厚度 */
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.05),
    0 -10px 30px rgba(0, 0, 0, 0.5);
}

:deep(.strategy-layer:hover) {
  /* 悬停时稍微加亮背景，增加交互感 */
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(0, 255, 170, 0.4) !important;
}

/* 在画布背景放一个微弱的紫色或青色光晕，透过毛玻璃看会非常美 */
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

/* 1. 搜索外层容器 */
.search-wrapper {
  display: flex;
  align-items: center;
  height: 34px; /* 稍微加高一点，视觉更稳 */
  width: 34px;
  background: transparent;
  border: 1px solid transparent;
  padding: 0;
  border-radius: 100px; /* 始终保持圆角 */

  /* 关键：使用 Apple 风格的五级贝塞尔曲线 */
  transition:
    width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;

  /* 告诉浏览器优化这两个属性的渲染 */
  will-change: width, background-color;
  cursor: pointer;
  position: absolute; /* 关键：改为绝对定位或使用 Flex 占据剩余空间 */
  right: 16px;
  z-index: 5;
}

/* 2. 激活状态：宽度展开 */
.search-wrapper.is-active {
  width: calc(100% - 50px);
  background: rgba(15, 15, 15, 0.96);
  backdrop-filter: blur(50px) saturate(120%);
  border-color: rgba(255, 255, 255, 0.15);
  padding: 0 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

/* 3. 图标动画：增加轻微的旋转或弹跳感 */
.search-trigger-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-wrapper.is-active .search-trigger-icon {
  color: #fff;
  transform: rotate(90deg); /* 展开时图标旋转 90 度，增加动感 */
}

/* 4. 输入框：分步淡入 */
.search-input {
  width: 100%; /* 充满容器 */
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;

  /* 初始隐藏 */
  opacity: 0;
  transform: translateX(10px); /* 初始向右偏移 */

  /* 延迟执行，等待框体展开 0.2s 后再淡入文字 */
  transition:
    opacity 0.4s ease 0.2s,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
}

.search-wrapper.is-active .search-input {
  opacity: 1;
  transform: translateX(0); /* 回到原位 */
  margin-left: 10px;
}
/* 4. 【核心交互】：悬停效果 - 放大且发出“白月光” */
.search-wrapper:not(.is-active):hover .search-trigger-icon {
  color: #ffffff; /* 悬停变为纯白 */
  transform: scale(1.25);
  /* White Line-glow：纯净的白色线条发光 */
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

/* 5. 激活状态下的图标颜色保持白色 */
.search-wrapper.is-active .search-trigger-icon {
  color: rgba(255, 255, 255, 0.9);
}

/* 6. 输入框样式 */
.search-input {
  width: 0;
  opacity: 0;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  transition: all 0.4s ease;
}

.search-wrapper.is-active .search-input {
  width: 130px;
  opacity: 1;
  margin-left: 10px;
}

/* 内部高光边缘（让玻璃显得更厚实） */
.search-wrapper.is-active::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* 这道内阴影能让白色光效更有层次 */
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

/* 6. 输入框样式 */
.search-input {
  width: 0;
  opacity: 0;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  margin-left: 0;
  transition: all 0.4s ease;
}

/* 1. 进入和离开的容器动画 */
.atom-list-enter-active {
  /* 进入动画：稍微慢一点，产生呼吸感 */
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.atom-list-leave-active {
  /* 离开动画：快一点，迅速让位 */
  transition: all 0.3s ease;
  /* 关键：离开时脱离文档流，防止挤占新列表的位置 */
  position: absolute;
  width: calc(100% - 48px); /* 保持与容器宽度一致 */
}

/* 2. 进入时的状态：从上方滑入，带缩放 */
.atom-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* 3. 离开时的状态：向下方沉降，淡出 */
.atom-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 4. 排序平滑移动：当列表项位置变化时 */
.atom-list-move {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 无结果时的提示样式 */
.no-results {
  text-align: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 40px;
  letter-spacing: 2px;
}

/* 表名切换容器 */
.table-selector {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 1;
  transform: translateX(0);
  flex-shrink: 0; /* 防止被挤压变形 */
}

/* 当搜索激活时，左侧标题淡出并向左微移 */
.table-selector.is-hidden {
  opacity: 0;
  transform: translateX(-20px);
  pointer-events: none; /* 隐藏时不可点击 */
}

/* 触发按钮样式 */
.selector-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.selector-trigger:hover {
  background: rgba(255, 255, 255, 0.05);
}

.selector-trigger .rotate {
  transform: rotate(180deg);
}

/* 下拉菜单：重度磨砂白边 */
.table-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 160px;
  background: rgba(15, 15, 15, 0.96);
  backdrop-filter: blur(50px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.15); /* 统一白月光边框 */
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.table-item {
  padding: 10px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.table-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.table-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  /* 激活时左侧加一道白色的细杠，增强提示 */
  box-shadow: inset 2px 0 0 #fff;
}

/* 存档卡片基础样式 */
.archive-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  transition:
    background 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.3s;
  cursor: pointer;
  transform: scale(1);
  flex-shrink: 0;
}

/* 悬停时的“白月光”呼吸感 */
.archive-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.archive-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.archive-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #fff;
  letter-spacing: 1px;
}

.archive-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}

.meta-item {
  font-size: 10px;
  margin-bottom: 6px;
}

.meta-label {
  color: rgba(255, 255, 255, 0.2);
  margin-right: 6px;
}
.meta-value {
  color: #fff;
}

.meta-row {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

/* 扫光特效：让卡片看起来像高级玻璃 */
.archive-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.03), transparent);
  transform: rotate(45deg);
  transition: 0.8s;
}

.archive-card:hover::before {
  left: 100%;
  top: 100%;
}

/* 1. 进入动画：从下方轻微弹入 */
.canvas-list-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.canvas-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* 2. 离场动画：关键的“向上飘散”效果 */
.canvas-list-leave-active {
  transition: all 0.8s cubic-bezier(0.7, 0, 0.3, 1);
  position: absolute; /* 必须，防止占位 */
  width: 100%; /* 保持宽度 */
  z-index: 10;
}

/* 3. 离场后的最终状态 */
.canvas-list-leave-to {
  opacity: 0;
  /* 向上移动 100 像素，并带一点点缩小 */
  transform: translateY(-100px);
  /* 增加模糊感，模拟远去的效果 */
  filter: blur(10px);
}

/* 4. 列表移动动画：让其他元素平滑过渡 */
.canvas-list-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 菜单动画 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.right-panel .panel-scroll {
  /* 在内容未溢出时也预留滚动条空间，防止页面抖动 */
  scrollbar-gutter: stable;
}

/* 右侧面板主体：确保它是纵向排列的容器 */
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%; /* 占据全高 */
}

/* 头部：固定高度，不参与滚动 */
.right-panel .panel-header {
  flex-shrink: 0; /* 禁止收缩，保证头部高度固定 */
  padding: 20px 24px;
}

/* 核心滚动区：处理溢出 */
.right-panel .panel-scroll {
  flex: 1; /* 自动填充剩余的所有高度 */
  overflow-y: auto; /* 纵向溢出时显示滚动条 */
  overflow-x: hidden; /* 禁止横向滚动 */
  padding: 0 16px 20px 24px; /* 留出右侧空间给滚动条 */

  /* 确保过渡动画的绝对定位不会乱跑 */
  position: relative;
}

/* 自定义滚动条整体样式 */
.right-panel .panel-scroll::-webkit-scrollbar {
  width: 4px; /* 极细的宽度 */
}

/* 滚动条轨道：保持透明 */
.right-panel .panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* 滚动条滑块：白月光半透明质感 */
.right-panel .panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: background 0.3s;
}

/* 悬停时滑块变亮 */
.right-panel .panel-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

/* 进入前的初始状态：锁定 scale 为 1 */
.archive-list-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(1);
}

/* 离开后的结束状态：锁定 scale 为 1 */
.archive-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(1);
}

/* 动画过程：只针对特定的属性进行过渡，防止 all 带来的抖动 */
.archive-list-enter-active,
.archive-list-leave-active,
.archive-list-move {
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
/* 离开时脱离文档流，防止宽度抖动 */
.archive-list-leave-active {
  position: absolute;
  width: calc(100% - 40px);
}

/* 头部标题组的淡出效果 */
.header-label-group {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.header-label-group.is-hidden {
  opacity: 0;
  transform: translateX(-20px);
  pointer-events: none;
}

/* 存档计数器小角标 */
.archive-count {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 确保右侧搜索框展开方向和定位 */
.right-panel .search-wrapper {
  position: absolute;
  right: 16px; /* 贴紧右侧内边距 */
}

.right-panel .search-wrapper.is-active {
  /* 这里的宽度计算要考虑到右侧面板的内边距 */
  left: 16px;
  right: 16px;
  width: auto; /* 必须设为 auto，否则宽度会冲突 */

  background: rgba(15, 15, 15, 0.98);
  backdrop-filter: blur(50px) saturate(120%);
  border-color: rgba(255, 255, 255, 0.15);
  padding: 0 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.right-panel .search-wrapper.is-active .search-input {
  flex: 1; /* 让输入框占据剩下的所有空间 */
  width: auto; /* 取消固定宽度 */
  opacity: 1;
  margin-left: 10px;
}

/* 确保归档列表的包裹容器是正常的块级 */
.archive-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* 之前被删掉的内部文字样式 */
.archive-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.archive-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #fff;
}

.archive-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}

.meta-item {
  font-size: 10px;
  margin-bottom: 4px;
}

.meta-label {
  color: rgba(255, 255, 255, 0.2);
}
.meta-value {
  color: #fff;
}

.meta-row {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.divider {
  color: rgba(255, 255, 255, 0.1);
}

/* Toast 容器定位 */
.toast-wrapper {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

/* Toast 主体：磨砂玻璃 + 青色发光 */
.toast-content {
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(0, 255, 170, 0.3); /* 青色半透明边框 */
  padding: 12px 24px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 255, 170, 0.1); /* 微弱的外发光 */
}

.toast-icon {
  width: 22px;
  height: 22px;
  background: rgba(0, 255, 170, 0.2);
  color: #00ffaa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-text {
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 1px;
}

/* 底部自动消耗的进度条（白月光细节） */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffaa, transparent);
  filter: blur(1px);
  animation: progressHide 2.5s linear forwards;
}

@keyframes progressHide {
  from {
    width: 60%;
    opacity: 1;
  }
  to {
    width: 0%;
    opacity: 0;
  }
}

/* Toast 过渡动画：向上滑入滑出 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 底部按钮区布局 */
.canvas-footer {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  z-index: 100;
}

/* 底部按钮区：增加背景微弱遮罩，突出按钮 */
.canvas-footer {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 100;
  padding: 10px 30px;
  /* 可选：给按钮下方加一个极淡的阴影，增加浮动感 */
  background: radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
}

/* 统一的“白月光”按钮样式 */
.action-btn-unified {
  position: relative;
  height: 44px;
  min-width: 160px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.03); /* 极低透明度的底色 */
  border: 1px solid rgba(255, 255, 255, 0.1); /* 细微的白边 */
  border-radius: 8px; /* 稍微硬朗一点的圆角 */
  color: rgba(255, 255, 255, 0.6);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

/* 悬停状态：整体变亮，边框发光 */
.action-btn-unified:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.4),
    0 0 12px rgba(255, 255, 255, 0.05);
}

/* 图标动画 */
.btn-icon {
  transition: transform 0.3s ease;
  opacity: 0.7;
}

.action-btn-unified:hover .btn-icon {
  transform: scale(1.1);
  opacity: 1;
}

/* 内部流光轨道 (细节装饰) */
.btn-light-track {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: 0s;
}

.action-btn-unified:hover .btn-light-track {
  left: 100%;
  transition: 0.8s ease;
}

/* 点击反馈 */
.action-btn-unified:active {
  transform: translateY(0) scale(0.97);
  background: rgba(255, 255, 255, 0.12);
}
</style>
