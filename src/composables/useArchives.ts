/**
 * useArchives.ts - 全功能模拟版
 * 既支持纯前端测试，又保留了 UI 所需的所有响应式接口
 */
import { ref, computed } from 'vue'

// 💡 关键 1：数据放在函数外，确保全局单例，所有组件共享同一份存档数据
const archives = ref([
  {
    id: 1,
    title: '历史示例策略',
    time: '2026-01-20 10:00',
    tableName: 'USER_PROFILE',
    totalCount: '1,200',
    coverage: '13%',
    status: 'inactive' as const,
    logicData: [],
  },
])

// 💡 关键 2：搜索状态也建议全局化，防止组件切换时搜索词丢失
const isArchiveSearchActive = ref(false)
const archiveSearchQuery = ref('')

export function useArchives() {
  const isSyncing = ref(false)

  /**
   * 💡 关键 3：保留过滤逻辑，防止 UI 渲染 filteredArchives 时报错
   */
  const filteredArchives = computed(() => {
    const query = archiveSearchQuery.value.toLowerCase().trim()
    if (!query) return archives.value

    return archives.value.filter(
      (record) =>
        record.title.toLowerCase().includes(query) ||
        record.tableName.toLowerCase().includes(query),
    )
  })

  const toggleArchiveSearch = () => {
    isArchiveSearchActive.value = !isArchiveSearchActive.value
  }

  /**
   * 纯前端模拟保存函数
   */
  const saveStrategyMock = async (payload: any, logicData: any, tableName: string) => {
    isSyncing.value = true

    // 2. 构造新记录
    const newRecord = {
      id: Date.now(),
      title: payload.title || '未命名策略',
      time: new Date().toLocaleString(),
      tableName: (tableName || 'USER_PROFILE').toUpperCase(),
      totalCount: Math.floor(Math.random() * 99999).toLocaleString(),
      status: 'active' as const,
      logicData: JSON.parse(JSON.stringify(logicData)), // 深度克隆当前画布快照
    }

    // 3. 插入到顶部
    archives.value.unshift(newRecord)

    console.log('%c✅ [Mock 保存成功]', 'color: #00ffaa; font-weight: bold;', newRecord)

    isSyncing.value = false
    return { success: true }
  }

  // 💡 必须导出 UI 正在使用的所有变量
  return {
    archives,
    filteredArchives, // 👈 修复 length 报错的关键：模板在循环这个！
    isSyncing,
    isArchiveSearchActive, // 👈 修复搜索图标点击无效
    archiveSearchQuery, // 👈 修复搜索输入无效
    toggleArchiveSearch,
    saveStrategyMock,
  }
}
