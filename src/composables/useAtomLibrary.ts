/**
 * useAtomLibrary.ts
 * 职责：管理原子资产库的状态，包括数据源切换和搜索过滤
 */

import { ref, computed } from 'vue'
import type { Atom } from '@/types/tag-lab' // 引用第一步定义的标准类型

export function useAtomLibrary() {
  // 1. 原始原子数据 (模拟多表数据源)
  const tableData: Record<string, Atom[]> = {
    user_profile: [
      { id: 1, name: 'register_time', label: '注册时间' },
      { id: 2, name: 'apply_time', label: '授信时间' },
      { id: 3, name: 'amount', label: '授信额度' },
      { id: 4, name: 'credit_type', label: '授信状态' },
      { id: 5, name: 'trans_time', label: '交易时间' },
      { id: 6, name: 'trans_amount', label: '交易金额' },
      { id: 7, name: 'regist_from_name', label: '注册渠道' },
    ],
    order_info: [
      { id: 101, name: 'pay_amt', label: '累计消费金额' },
      { id: 102, name: 'order_count', label: '订单总数' },
    ],
    device_data: [{ id: 201, name: 'os_type', label: '操作系统' }],
  }

  // 2. 响应式状态
  const currentTable = ref('user_profile')
  const searchQuery = ref('')
  const isTableMenuOpen = ref(false)
  const isSearchActive = ref(false)

  // 3. 计算属性：基于搜索词和当前表进行过滤
  const filteredAtoms = computed(() => {
    const atoms = tableData[currentTable.value] || []
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return atoms
    return atoms.filter(
      (atom) => atom.name.toLowerCase().includes(query) || atom.label.toLowerCase().includes(query),
    )
  })

  // 4. 操作方法
  const selectTable = (name: string) => {
    currentTable.value = name
    isTableMenuOpen.value = false
  }

  return {
    currentTable,
    searchQuery,
    isTableMenuOpen,
    isSearchActive,
    tableData,
    filteredAtoms,
    selectTable,
  }
}
