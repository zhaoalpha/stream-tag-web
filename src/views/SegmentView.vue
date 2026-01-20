<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Plus, Check, Search, Users, X } from 'lucide-vue-next'
import SegmentGroup from '../components/SegmentGroup.vue'

// --- 1. 模拟人群数据 ---
const mockAssets = ref([
  { id: 'a1', title: '注册5分钟且未授信', count: '12,402' },
  { id: 'a2', title: '授信10分钟且未下单', count: '5,120' },
  { id: 'a3', title: '高价格敏感度用户', count: '8,841' },
  { id: 'a4', title: '高流式概率用户', count: '21,034' },
  { id: 'a5', title: '高逾期风险用户', count: '3,445' },
])

// --- 2. 搜索逻辑：点击覆盖标题 ---
const isSearching = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const filteredAssets = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return mockAssets.value
  return mockAssets.value.filter((asset) => asset.title.toLowerCase().includes(query))
})

const openSearch = async () => {
  isSearching.value = true
  await nextTick()
  searchInput.value?.focus()
}

const closeSearch = () => {
  isSearching.value = false
  searchQuery.value = ''
}

// --- 3. 策略组状态 ---
const segmentGroups = ref([{ id: Date.now(), logic: 'AND' as const, tags: [] as any[] }])

const handleDragStart = (e: DragEvent, asset: any) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('assetData', JSON.stringify(asset))
  }
}

const handleDropToGroup = (groupId: number, asset: any) => {
  const target = segmentGroups.value.find((g) => g.id === groupId)
  if (target && !target.tags.find((t) => t.id === asset.id)) {
    target.tags.push({ ...asset })
  }
}

const handleToggleLogic = (groupId: number) => {
  const target = segmentGroups.value.find((g) => g.id === groupId)
  if (target) target.logic = target.logic === 'AND' ? 'OR' : 'AND'
}

const handleRemoveTag = (groupId: number, tagId: string) => {
  const target = segmentGroups.value.find((g) => g.id === groupId)
  if (target) target.tags = target.tags.filter((t) => t.id !== tagId)
}

const addNewGroup = () => {
  segmentGroups.value.push({ id: Date.now(), logic: 'AND', tags: [] })
}

const handleRemoveGroup = (groupId: number) => {
  if (segmentGroups.value.length > 1) {
    segmentGroups.value = segmentGroups.value.filter((g) => g.id !== groupId)
  }
}

// 实现归档
const archiveScrollRef = ref<HTMLElement | null>(null)
const archives = ref<any[]>([])
const strategyName = ref('未命名分群矩阵')
const isResetting = ref(false) // 新增：重置状态锁
// 1. Toast 状态
const showToast = ref(false)
const toastMessage = ref('')
const triggerToast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true

  // 2.5秒后自动关闭
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

// 2. 保存分群结果的逻辑
const handleSave = () => {
  if (segmentGroups.value.length === 1 && segmentGroups.value[0].tags.length === 0) {
    return
  }

  // 1. 开启重置锁 (防止空状态提示在动画期间闪现)
  isResetting.value = true

  // --- 存档逻辑 ---
  const newArchive = {
    id: Date.now(),
    title: strategyName.value || `未命名分群_${archives.value.length + 1}`,
    tagCount: segmentGroups.value.reduce((sum, g) => sum + g.tags.length, 0),
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    logicData: JSON.parse(JSON.stringify(segmentGroups.value)),
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
  // 2. 触发动画：完全对齐 TagView，先清空让卡片“向上飘走”
  segmentGroups.value = []

  setTimeout(() => {
    segmentGroups.value = [
      {
        id: Date.now(),
        logic: 'AND' as const,
        tags: [] as any[],
      },
    ]
  }, 100)
}

// 3. 加载归档数据
const loadArchive = (record: any) => {
  // 触发一次重置锁，让加载过程也有一个干净的过渡
  isResetting.value = true

  // 先清空当前工作台（触发飘散动画）
  segmentGroups.value = []

  // 100ms 后注入存档数据，产生“瞬间加载”的视觉感
  setTimeout(() => {
    // 使用深拷贝，防止修改工作台时影响到存档记录
    segmentGroups.value = JSON.parse(JSON.stringify(record.logicData))

    // 同步恢复名称
    strategyName.value = record.title

    nextTick(() => {
      isResetting.value = false
    })
  }, 150) // 稍微快一点的加载节奏，显得系统性能很强
}
</script>

<template>
  <main class="main-content">
    <aside class="side-panel left-panel">
      <div class="panel-header">
        <div v-show="!isSearching" class="title-layer">
          <span class="panel-label">人群资产库</span>
          <Search :size="14" class="search-trigger-icon" @click="openSearch" />
        </div>

        <Transition name="search-fade">
          <div v-if="isSearching" class="search-overlay">
            <Search :size="14" class="search-inner-icon" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索资产..."
              class="search-input-active"
              @blur="searchQuery === '' ? closeSearch() : null"
              @keyup.esc="closeSearch"
            />
            <X :size="14" class="search-close-icon" @click="closeSearch" />
          </div>
        </Transition>
      </div>

      <div class="panel-scroll">
        <div
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="asset-card"
          draggable="true"
          @dragstart="handleDragStart($event, asset)"
        >
          <div class="asset-info">
            <div class="asset-title">{{ asset.title }}</div>
            <div class="asset-meta">{{ asset.count }} 用户</div>
          </div>
          <Plus :size="14" class="add-icon" />
        </div>
        <div v-if="filteredAssets.length === 0" class="empty-hint-small">未找到相关资产</div>
      </div>
    </aside>

    <section class="canvas-area">
      <div class="canvas-top-bar">
        <input
          type="text"
          class="title-input"
          v-model="strategyName"
          placeholder="请输入分群名称..."
        />
        <div class="status-badge">
          <span class="dot"></span>
          STATUS: ACTIVE
        </div>
      </div>
      <!-- <div class="canvas-top-bar">
        <input type="text" class="title-input" value="未命名分群矩阵" />
      </div> -->

      <div class="canvas-scroll-container">
        <TransitionGroup name="canvas-list">
          <SegmentGroup
            v-for="(group, index) in segmentGroups"
            :key="group.id"
            class="group-stack-item"
            :style="{ zIndex: index }"
            :group-data="group"
            @toggle-logic="handleToggleLogic(group.id)"
            @remove-tag="(tagId) => handleRemoveTag(group.id, tagId)"
            @remove-group="handleRemoveGroup(group.id)"
            @drop-asset="(asset) => handleDropToGroup(group.id, asset)"
          />
        </TransitionGroup>
      </div>

      <div class="canvas-footer">
        <button class="action-btn-unified" @click="addNewGroup">
          <Plus :size="16" /> <span>新增组合组</span>
        </button>
        <button class="action-btn-unified btn-save" @click="handleSave">
          <Check :size="16" /> <span>保存分群结果</span>
        </button>
      </div>
    </section>

    <aside class="side-panel right-panel">
      <div class="panel-header">
        <span class="panel-label">分群归档</span>
        <span class="archive-count" v-if="archives.length > 0">{{ archives.length }}</span>
      </div>

      <div class="panel-scroll">
        <TransitionGroup name="archive-list">
          <div
            v-for="item in archives"
            :key="item.id"
            class="archive-card"
            @click="loadArchive(item)"
          >
            <div class="archive-card-header">
              <span class="archive-title">{{ item.title }}</span>
              <span class="archive-time">{{ item.time }}</span>
            </div>
            <div class="archive-card-body">
              <span class="meta-tag">{{ item.tagCount }} 个原子标签</span>
            </div>
          </div>
        </TransitionGroup>

        <div v-if="archives.length === 0" class="empty-holder">
          <Users :size="48" class="empty-icon" />
          <p>暂无存档记录</p>
        </div>
      </div>
    </aside>
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
  height: calc(100vh - 64px);
  background-color: #050505;
  overflow: hidden;
}

/* --- 面板样式 --- */
.side-panel {
  width: 300px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
}

.panel-header {
  position: relative;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.title-layer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.panel-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
}

.search-trigger-icon {
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: 0.3s;
}

.search-trigger-icon:hover {
  color: #fff;
}

.search-overlay {
  position: absolute;
  inset: 0;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  z-index: 10;
}

.search-input-active {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.search-close-icon {
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

/* --- 资产卡片 --- */
.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.asset-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.3s;
}

.asset-card:hover {
  transform: translateX(6px);
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}

.asset-title {
  font-size: 13px;
  color: #fff;
}

.asset-meta {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

/* --- 画布堆叠逻辑：后浪覆盖前浪 --- */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 20px;
}

.canvas-scroll-container {
  /* flex: 1;
  overflow-y: auto;
  padding: 40px 40px 200px 40px; */

  flex: 1;
  overflow-y: auto;
  padding: 20px 4px 150px;
  display: flex;
  flex-direction: column;
}

/* .group-stack-item {
  position: relative;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 -15px 35px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
} */

/* 向上偏移覆盖前一个 */
/* .group-stack-item+.group-stack-item {
  margin-top: -160px;
} */

/* .group-stack-item:hover {
  transform: translateY(-10px);
  z-index: 999 !important;
} */

/* 鼠标悬停时，后面的（盖在上面的）下移，露出内容 */
/* .group-stack-item:hover~.group-stack-item {
  transform: translateY(220px);
} */

/* --- 其他 UI --- */
/* .title-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  outline: none;
  margin-bottom: 20px;
} */

.canvas-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 1000;
}

.action-btn-unified {
  height: 44px;
  min-width: 150px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: 0.3s;
}

.action-btn-unified:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}

.empty-holder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.1);
  gap: 16px;
}

.search-fade-enter-active,
.search-fade-leave-active {
  transition: all 0.3s ease;
}

.search-fade-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

/* yx --->新增 */
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

/* 1. 进场动画：0.6s 曲线，30px 位移 (对齐 TagView) */
.canvas-list-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.canvas-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98); /* 稍微加一点 scale 会更灵动 */
}

/* 2. 离场动画：0.8s 曲线，100px 位移 + 10px 模糊 (对齐 TagView) */
.canvas-list-leave-active {
  transition: all 0.8s cubic-bezier(0.7, 0, 0.3, 1);
  position: absolute; /* 必须，防止占位 */
  width: 100%; /* 保持宽度 */
  z-index: 10;
}

.canvas-list-leave-to {
  opacity: 0;
  transform: translateY(-100px);
  filter: blur(10px);
}

/* 3. 排序移动动画 */
.canvas-list-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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

:deep(.segment-group-card) {
  margin-bottom: -140px;
  /* 默认向上挤压，只露出头部 */
  height: 190px;
  overflow: hidden;
  /* 隐藏掉下面的条件 */
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(10, 10, 10, 0.9) !important;
  backdrop-filter: blur(20px);
  position: relative;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
}

/* 关键：为 StrategyGroup 组件添加堆叠样式 */
:deep(.segment-group-card) {
  margin-bottom: -140px;
  /* 默认向上挤压，只露出头部 */
  height: 190px;
  overflow: hidden;
  /* 隐藏掉下面的条件 */
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(10, 10, 10, 0.9) !important;
  backdrop-filter: blur(20px);
  position: relative;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
}

/* 最后一个组（Root）默认永远展开 */
:deep(.segment-group-card:last-child) {
  margin-bottom: 0;
  height: auto;
  min-height: 200px;
}

/* 鼠标悬停时的“抽屉”展开效果 */
:deep(.segment-group-card:hover) {
  margin-bottom: 20px;
  height: auto;
  min-height: 240px;
  transform: translateY(-8px);
  /* 悬停时往上弹一点 */
  z-index: 100 !important;
  border-color: rgba(0, 255, 170, 0.3) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
}

/* 针对 StrategyGroup 内部或外部容器的修改 */
:deep(.segment-group-card) {
  /* ...原有样式... */
  background: rgba(20, 20, 20, 0.4) !important;
  /* 调整为带有灰度的透明 */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* 添加微弱的顶部内发光，模拟玻璃厚度 */
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.05),
    0 -10px 30px rgba(0, 0, 0, 0.5);
}

:deep(.segment-group-card:hover) {
  /* 悬停时稍微加亮背景，增加交互感 */
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(0, 255, 170, 0.4) !important;
}

/* 存档卡片样式 */
.archive-card {
  position: relative; /* 必须，为流光定位 */
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden; /* 裁剪流光 */
}

/* 扫光特效：让卡片看起来像高级玻璃 */
.archive-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -150%;
  width: 100%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: rotate(35deg);
  transition: 0s;
}

.archive-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-4px) scale(1.02); /* 悬浮稍微放大 */
}

/* 悬停时触发扫光动画 */
.archive-card:hover::before {
  left: 150%;
  transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.archive-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.archive-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.archive-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #fff;
}

.archive-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
}

.meta-tag {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

/* 归档计数角标 */
.archive-count {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
}

.title-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 28px;
  outline: none;
  width: 60%;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s;
}

/* 鼠标悬停时，显示底边提示可以编辑 */
.title-input:hover {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

/* 聚焦输入时，底边加亮 */
.title-input:focus {
  border-bottom-color: rgba(255, 255, 255, 0.4);
}
</style>
