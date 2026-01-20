<script setup lang="ts">
/**
 * TagLabView.vue - 最终集成版
 * 职责：负责总布局编排，作为三大“原子”组件的通讯母舰
 */
import { ref } from 'vue'
import ATOM from '@/components/Atom.vue' // 左侧：资产库
import CanvasAtom from '@/components/CanvasAtom.vue' // 中间：编排区
import ArchiveAtom from '@/components/ArchiveAtom.vue' // 右侧：存档区
import { useAtomLibrary } from '@/composables/useAtomLibrary'
import { useArchives } from '@/composables/useArchives'
import { useStrategyEngine } from '@/composables/useStrategyEngine'
import ToastAtom from '@/components/ToastAtom.vue'
const canvasRef = ref<any>(null)
/**
 * 核心交互：处理保存申请
 * 当 CanvasAtom 发出 @save 事件时触发
 */

const { currentTable } = useAtomLibrary() // 获取当前选中的表名
const { tagName, preparePayload, groups, resetCanvas } = useStrategyEngine() // 共享的引擎状态

const { saveStrategyMock, isSyncing } = useArchives()
const onHandleSave = async (tableName: string) => {
  if (!tagName.value || tagName.value.trim() === '') {
    // 触发输入框的错误状态（见第二步）
    canvasRef.value?.triggerTitleError()
    // 可以弹出一个简单的提示，或者使用我们之前的 Toast
    return
  }

  const targetTable = currentTable.value
  // 1. 准备数据包
  const payload = preparePayload(targetTable)

  // 2. 调用存档服务进行同步
  const result = await saveStrategyMock(payload, groups.value, tableName)

  if (result.success) {
    // 3. 保存成功后，执行画布重置动画
    resetCanvas()
  }
}

/**
 * 核心交互：处理存档回填
 * 当 ArchiveAtom 发出 @load 事件时触发
 */
const onHandleLoad = (record: any) => {
  console.log('🔄 正在从存档恢复策略:', record.title)

  // 1. 恢复标题
  tagName.value = record.title

  // 2. 恢复策略逻辑 (核心关键：使用 JSON 转换进行深拷贝)
  // 💡 为什么要深拷贝？为了防止修改画布时，意外改掉右侧存档列表里的原始数据
  groups.value = JSON.parse(JSON.stringify(record.logicData))

  // 3. 联动左侧：自动切换到该存档所属的数据表
  if (record.tableName) {
    // 假设您的 selectTable 接收小写表名
    selectTable(record.tableName.toLowerCase())
  }

  // 4. 增加一个“加载成功”的小提示 (可选)
  successMessage.value = `STRATEGY "${record.title}" RESTORED`
  showSuccessToast.value = true
  setTimeout(() => {
    showSuccessToast.value = false
  }, 2000)
}

const showToast = ref(false)
const toastMsg = ref('')

const handleTimeWarning = (label: string) => {
  console.log('📢 指挥部收到警告信号，准备点亮 Toast');
  // 填充信息，ToastAtom 内部会自动识别并变黄
  toastMsg.value = `⚠️ 字段检测：[${label}] 是时间类型，请确保输入单位（sec/min/hour/day）`
  showToast.value = true

  // 4秒后自动关闭
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}
</script>

<template>
  <div class="aether-container">
    <ToastAtom :show="showToast" :message="toastMsg" />
    <MainHeader />

    <main class="main-content">
      <ATOM />

      <CanvasAtom
        :is-loading="isSyncing"
        ref="canvasRef"
        @save="(table) => onHandleSave(table)"
        @time-warning="handleTimeWarning"
      />

      <ArchiveAtom @load="onHandleLoad" />
    </main>
  </div>
</template>

<style scoped>
/* 现在的 CSS 极度精简，只负责主排版 */
.main-content {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
  overflow: hidden; /* 防止出现双滚动条 */
  height: calc(100vh - 80px); /* 扣除 Header 高度 */
}

/* 所有的细节样式（流光、按钮、卡片）都已经去往各自的“原子”组件内部了 */
</style>
