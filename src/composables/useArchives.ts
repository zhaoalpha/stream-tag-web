/**
 * useArchives.ts - 全功能模拟版
 * 既支持纯前端测试，又保留了 UI 所需的所有响应式接口
 */
import { ref, computed } from 'vue'
import { tagApi } from '@/api/tag'

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

  const saveStrategy = async (payload: any, logicData: any, tableName: string) => {
    isSyncing.value = true

    // 构造后端需要的标准 JSON 结构
    const submitData = {
      title: payload.title || '未命名策略',
      table: tableName.toLowerCase(),
      // 2. 映射规则字段
      groups: logicData.map((group: any) => ({
        // 1. 将逻辑转为小写 (AND -> and)
        logic: group.logic.toLowerCase(),

        // 2. 映射规则字段 (将 tags 转换为 rules)
        rules: group.tags.map((tag: any) => ({
          field: tag.name, // 对应后端的字段标识 (如 age)
          operator: tag.operator,
          value: tag.value,
        })),
      })),
    }
    try {
      const res: any = await tagApi.saveStrategy(submitData)
      // 保存成功后，为了保证数据最准，我们重新拉取一次列表
      const newArchiveItem = {
        id: res.data?.id || Date.now(), // 优先用后端 ID，没有就用时间戳
        title: submitData.title,
        time: new Date().toLocaleString(),
        tableName: submitData.table,
        totalCount: res.toLocaleString(),
        status: 'active' as const,
        logicData: JSON.parse(JSON.stringify(logicData)), // 深度克隆当前画布的逻辑，用于以后回填
      }

      // 5. 将新数据直接压入 archives 列表的最顶部
      archives.value.unshift(newArchiveItem)
      return { success: true }
    } catch (error) {
      console.error('保存失败:', error)
      return { success: false, error }
    } finally {
      isSyncing.value = false
    }
  }

  // 💡 必须导出 UI 正在使用的所有变量
  return {
    archives,
    filteredArchives,
    isSyncing,
    isArchiveSearchActive,
    archiveSearchQuery,
    toggleArchiveSearch,
    saveStrategy,
  }
}
